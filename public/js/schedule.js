const s1 = document.getElementById("from");
const s2 = document.getElementById("to");

s1.addEventListener("change", function()
{
    s2.options.getAttribute(s1.value).setAttribute("disabled");
})


function generate(s1, s2)
    {
        var s1 = document.getElementById(s1);
        var s2 = document.getElementById(s2);

        console.log(s1.value)

        s2.innerHTML = "";

        if(s1.value == "Midtown East"){
            var optionArray = ['brooklyn|Brooklyn', 'stamford|Stamford', 'newark|Newark'];
        
        }

        else if(s1.value == 'brooklyn') {
            var optionArray = ['manhattan|Manhattan', 'stamford|Stamford', 'newark|Newark'];
        }

        else if(s1.value == 'stamford') {
            var optionArray = ['manhattan|Manhattan', 'brooklyn|Brooklyn', 'newark|Newark'];
        }

        else if(s1.value == 'newark') {
            var optionArray = ['manhattan|Manhattan', 'brooklyn|Brooklyn', 'stamford|Stamford'];
        }

        for(var option in optionArray){
            var pair = optionArray[option].split("|");
            var newoption = document.createElement("option");

            newoption.value = pair[0];
            newoption.innerHTML=pair[1];
            s2.options.add(newoption);
        }

    }