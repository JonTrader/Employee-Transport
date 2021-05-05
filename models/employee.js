const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const EmployeeSchema = new Schema(
{
    
    title: String,
    givenName: String,
    middleInitial: String,
    surname: String,
    employeeID:  Number,
    occupation: String,
    username: String,
    local: String,
    state: String

})

EmployeeSchema.statics.findAndValidate = async function(username, password)
{
    const foundUser = await this.findOne({ username });
    const validPassword = await parseInt(password) === foundUser.employeeID;
    return validPassword ? foundUser : false;
}

module.exports = mongoose.model("Employee", EmployeeSchema);