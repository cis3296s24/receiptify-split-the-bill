var users = ['users1', 'users2', 'users3'];
var tokens = ['token1', 'token2', 'token3'];
var objectsArray = users.map((user, index) => ({ user, token: tokens[index]}));


console.log(objectsArray);
console.log(objectsArray.map(obj => obj.token).includes('token3'));