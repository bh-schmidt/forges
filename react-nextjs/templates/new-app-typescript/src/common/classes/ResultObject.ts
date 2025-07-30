export class ResultObject<TValue = any, TError = string> implements ResultObject<TValue, TError> {
    /**
     * Result value.
     */
    value?: TValue
    /**
     * List of errors.
     */
    errors: TError[]

    constructor(value?: ResultObject<TValue, TError>) {
        this.errors = []

        if (value) {
            this.value = value.value
            this.errors = value.errors
        }
    }

    isValid() {
        return !this.errors || this.errors.length == 0
    }

    importErrors(...results: ResultObject<any, TError>[]) {
        for (const result of results) {
            if (!result.errors) {
                continue
            }

            this.addErrors(...result.errors)
        }

        return this
    }

    setValue(value: TValue | undefined) {
        this.value = value
        return this
    }

    addErrors(...errors: TError[]) {
        if (!errors) {
            throw new Error('Error is required.')
        }

        this.errors ??= []
        this.errors.push(...errors)
        return this
    }

    static fromObj<TValue, TError>(value: ResultObject<TValue, TError>) {
        return new ResultObject(value)
    }

    static fromJson<TValue = any, TError = string>(json: string) {
        const parsed = JSON.parse(json)
        return new ResultObject<TValue, TError>(parsed)
    }
}