export interface Repository<Entity> {
	/*
	 * Get Entity
	 */
	get(options?: any, count?: boolean): Promise<Entity[] | [Entity[], number]>

	/*
	 * Get One
	 */
	getOne(id?: any, options?: any): Promise<Entity | undefined>

	/**
	 * Create Entity
	 */
	create(data: {}): Promise<Entity | undefined>

	/*
	 * Update Entity
	 */
	update(data: {}): Promise<Entity | undefined>

	/*
	 * Delete Entity
	 */
	delete(id: number | string): Promise<any>
}
