# JavaScript Data IO #
JavaScript read and write structured data to packed byte structures.

## Usage ##

```
npm install structured-io
```

```JavaScript
import {u8, fields, read, write} from 'structured-io';

class Message {
    constructor(version) {
        this.version = version;
    }

    static encoding = fields({
        version: u8(),
    });
}

let message = new Message(1);
let data = write(message);
let received = read(data, Message);
console.log(message, received);
JSON.stringify(message) == JSON.stringify(received);
```
