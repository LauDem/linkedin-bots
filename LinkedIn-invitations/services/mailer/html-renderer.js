
// Recursive function to get nested keys
function getValueFromNestedKey(obj, key) {
    let keys = key.split(".");
    let value = obj;
    
    for (let i = 0; i < keys.length; i++) {
        if (value[keys[i]] !== undefined) {
            value = value[keys[i]];
        } else {
            return undefined;
        }
    }
    return value;
}

// Function to replace brackets with object values
function replaceBrackets(str, obj) {
    return str.replace(/\{\{([^\{\}]*)\}\}/g, function (match, group) {
        let val = getValueFromNestedKey(obj, group.trim());
        if (Array.isArray(val)) val = val.join(', ');
        if (val === undefined) {
            throw new Error(`Could not replace "${match}" because corresponding key "${group}" does not exist in the provided object.`);
        }
        return val;
    });
}

// Test object with nested properties
let testData = {
    name: 'John Doe',
    address: {
        street: '123 Main St',
        city: 'Anytown',
        state: 'Anystate',
        country: 'AnyCountry'
    },
    hobbies: ['Reading', 'Running', 'Swimming']
};

let testStr = 'Hello, my name is {{name}}. I live at {{address.street}}, {{address.city}}, {{address.state}}, {{address.country}}. My hobbies are {{hobbies}}.';

let render = (inputStr, data)=>{
    if(!inputStr || !data ) {
        inputStr = testStr;
        data = testData;
        throw new Error('html renderer is expecting 2 parameters, inputStr and data')
    }
    try {
    let resultStr = replaceBrackets(inputStr, data);
    console.log(resultStr);
    return resultStr;
    
    } catch (error) {
        console.error(error);
        return false;
    }
}

render()