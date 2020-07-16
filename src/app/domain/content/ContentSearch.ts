import { diff } from 'deep-diff'
import { DefaultSearch, log, Hit } from '~/lib/util'
import { ContentSource, Content } from './'
import { ContentReference, ContentReferenceType, ReferenceDelta } from './types'

export class ContentSearch extends DefaultSearch<ContentSource> {
	/*
	 * Reference Keys
	 */
	protected refs: ContentReference[] = ['category', 'tag']

	/*
	 * Replace the document of an existing search index document
	 */
	public async replace(id: string, content: Content): Promise<boolean> {
		// Find current search source
		const search = await this.find(
			{
				query: {
					bool: {
						must: { match: { id } }
					}
				}
			},
			{ fields: this.refs }
		)

		// Not found?
		if (!search.data[0]) {
			// Log info
			log.info('Unable to replace indexed Content, it did not exist', { id })

			// Return bool
			return false
		}

		// Attempt individual document update
		const updated = await this.update(id.toString(), content)

		// Success?
		if (updated) {
			// Process any reference changes throughout the index
			await this.processReferenceDeltas(content, search.data[0], id.toString())
		}

		// Basic return
		return updated
	}

	/*
	 * Compare given content to it's already stored index version
	 * and process/update changes to references throughout the index
	 */
	private async processReferenceDeltas(
		content: Content,
		hit: Hit<ContentSource>,
		id?: string
	): Promise<void> {
		// Check for deltas
		const delta = this.parseReferenceDeltas(content, hit)

		// Iterate deltas
		for (let r = 0; r < delta.length; r++) {
			// Attmpet update
			const updated = await this.updateReference(
				delta[r].key,
				delta[r].data,
				id
			)

			// Continue if success
			if (updated) continue

			// Log error
			log.error(`Unable to update content search index reference`, {
				index: this.getClient().getIndex(),
				type: delta[r].key,
				id: delta[r].data.id
			})
		}

		// Refresh index once updates are done
		const refreshed = await this.refresh()

		// Not refreshed?
		if (!refreshed) {
			log.warn(
				'Unable to refresh search index upon updating content references',
				{ index: this.getClient().getIndex() }
			)
		}
	}

	/*
	 * Update index data and return reference delta
	 */
	private async updateReference(
		ref: ContentReference,
		data: ContentReferenceType,
		excludeId?: string
	): Promise<boolean> {
		try {
			// Attempt to update all ref values via query
			const response = await this.getSource().updateByQuery({
				index: this.getClient().getIndex(),
				refresh: false,
				conflicts: 'proceed',
				body: {
					script: {
						lang: 'painless',
						source: `try{for(int i=0;i<ctx._source.${ref}.length;i++){ if(ctx._source.${ref}[i].id == params.refId){ ctx._source.${ref}[i] = params.new_value; }}} catch(Exception e) { ctx._source.${ref} = params.new_value; }`,
						params: {
							refId: data.id,
							new_value: data
						}
					},
					query: {
						bool: {
							must: {
								term: { [`${ref}.id`]: data.id }
							},
							must_not: {
								term: {
									id: excludeId ? excludeId : 'undefined'
								}
							}
						}
					}
				}
			})

			// Log results for reference
			log.info('Full ContentSearch reference update response', response)

			// Return true if 200
			if (response.statusCode === 200) {
				// Log some specific info
				log.info('Reference Updated', {
					ref: {
						type: ref,
						id: data.id
					},
					timedOut: `${response.body.timed_out}`,
					executionTime: `${response.body.took}ms`,
					found: `${response.body.total}`,
					replaced: `${response.body.updated}`,
					batches: `${response.body.batches}`,
					versionConflicts: `${response.body.version_conflicts}`
				})

				// Success!
				return true
			}
		} catch (e) {
			log.error('ContentSearch reference global update error', {
				msg: e.message
			})
		}

		// Return false to signal an issue
		return false
	}

	/*
	 * Extract deltas
	 */
	private parseReferenceDeltas(
		content: Content,
		hit: Hit<ContentSource>
	): ReferenceDelta[] {
		// Init
		const delta: ReferenceDelta[] = []

		// Check for reference deltas
		for (let i = 0; i < this.refs.length; i++) {
			// Reference key
			const key = this.refs[i]

			// Source/update objects
			let source: any[] = []
			let update: any[] = []

			// Is content reference an array?
			if (Array.isArray(content[key])) {
				// Set to source
				update = content[key] as {}[]
			} else {
				update.push(content[key] as {})
			}

			// Is hit an array?
			if (Array.isArray(hit.source[key])) {
				// Set to source
				source = hit.source[key] as {}[]
			} else {
				source.push(hit.source[key] as {})
			}

			// Iterate source
			for (let s = 0; s < source.length; s++) {
				// Old value object
				const oldValue = source[s]

				// Has update?
				if (!update) continue

				// Iterate update values and see if it exists
				for (let u = 0; u < update.length; u++) {
					// New value obect
					const newValue = update[u]

					// Has new value?
					if (!newValue) continue

					if (typeof newValue !== undefined && oldValue.id == newValue.id) {
						// Do ids match?
						// Compare old to new
						const difference = diff(oldValue, newValue)

						// Differences?
						if (!difference) continue

						// Was objected edited at all?
						let edited = false

						for (let d = 0; d < difference.length; d++) {
							// Is it an edit?
							if (difference[d].kind === 'E') {
								edited = true
							}
						}

						// Add to deltas
						if (edited) delta.push({ key, data: newValue })
					}
				}
			}
		}

		// Return results
		return delta
	}
}
