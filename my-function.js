function saySomething(keyword) {
    const myName = "Raneem";  
    return `${myName} says ${keyword}`;
  }
  
  console.log(saySomething("hello")); 
  
  module.exports = saySomething;
  