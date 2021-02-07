# rsocket-js issue #110: Buffer type check is broken after upgrade rsocket.js to 0.0.22

Project to reproduce issue: https://github.com/rsocket/rsocket-js/issues/110#issuecomment-771163858

## Steps to reproduce

### `npm i`
### `npm run serve:all`
### Launch http://localhost:5000

## What happens?

Below comparison from LiteBuffer fails, because `obj.constructor.name` does not match the LiteBuffer one in built code.

```
function isInstance(obj, type) {
  return (
    obj instanceof type ||
    (obj != null &&
      obj.constructor != null &&
      obj.constructor.name != null &&
      obj.constructor.name === type.name)
  );
}
```

It works as expected in dev mode. 
