# JavaScript Data IO #
JavaScript read and write structured data to packed byte structures.

## Usage ##

```
npm install structured-io
```

```JavaScript
const {u24BE, auto, u8, read, write} = require('data-io');

class Body {
    constructor() {
        this.content=1056816;
    }
}

Body.encoding = [
    {"content":u24BE},
];

class Message {
    constructor() {
        this.version=1;
        this.body=new Body();
    }
}

Message.encoding = [
    {version:u8},
    {body:auto},
];
let message=new Message();
let data=write(new Message());
let received = read(data, null, Message);
console.log(message);
console.log(received);
```
