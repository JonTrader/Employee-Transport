const s1 = document.getElementById("from");
const s2 = document.getElementById("to");

s1.addEventListener("change", function()
{
    for (let value of s2)
    {
        if (value.getAttribute("value") === ""){}
        else value.removeAttribute("disabled");
    }

    s2[s1.options.selectedIndex].setAttribute("disabled", "true"); 

})

let v1 = s1[s1.options.selectedIndex].getAttribute("value");
let v2 = s2[s2.options.selectedIndex].getAttribute("value");
// get values to be able to look for in the database