export type AdvancedWhereClause = {
	value: any
	operator:
		| '!='
		| '<>'
		| '<'
		| '<='
		| '>'
		| '>='
		| '='
		| 'LIKE'
		| 'BETWEEN'
		| 'IN'
		| 'ANY'
		| 'IS NULL'
		| 'RAW'
		| 'IS NOT NULL'
}
