let list = ['Counterproductive',
'Disempowering',
'Meddlesome', 
'Overbearing',
'Demanding',
'Controlling',
'Intrusive',
'Obsessive',
'Nitpicking',
'Suffocating',
'Distrustful',
'Inflexible',
'Long', 
'Suffocating', 
'Frustrating', 
'Ineffective', 
'Stressful', 
'Toxic', 
'Limitating']

const listA = ['apple', 'banana', 'cherry', 'date', 'elderberry'];
list.sort((a, b) => b.length - a.length);
console.log(list.join(', '));
// Output: ['date', 'apple', 'banana', 'cherry', 'elderberry']

Counterproductive, 
Disempowering, 
Overbearing, 
Controlling, 
Suffocating, 
Distrustful, 
Suffocating, 
Frustrating, 
Ineffective, 
Meddlesome, 
Nitpicking, 
Inflexible, 
Limitating, 
Demanding, 
Intrusive, 
Obsessive, 
Stressful, 
Toxic, 
Long
