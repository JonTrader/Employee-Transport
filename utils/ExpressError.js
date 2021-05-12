class ExpressError extends Error{

    constructor(message, statusCode)
    {
        super();
        this.name = message;
        this.statusCode = statusCode;
    }

}

module.exports = ExpressError;