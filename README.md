# Model W — debounce

A simple function to debounce calls to other functions.

## Fire-and-forget usage

Example with a small script:

```shell
npm install axios open @model-w/debounce
```

```javascript
const { get } = require("axios");
const { debounce } = require("@model-w/debounce");

async function getTheCat() {
  try {
    const cats = await get(
      "https://api.thecatapi.com/v1/images/search"
    );
    const open = await import("open");

    for (const cat of cats.data) {
      await open.default(cat.url);
    }
  } catch (error) {
    console.error("🐕");
  }
}

// Debounce with a 500ms wait
const getTheCatDebounced = debounce(getTheCat, { delay: 500 });

// Whoops, small copy-pasting mistake...
getTheCatDebounced();
getTheCatDebounced();
// ...but thanks to `debounce`, `getTheCat` will be executed only once!
// Double-pasting code is thus not a concern of ours anymore 🥳
```

## Awaiting the final execution

Sometimes we would like to do something after a debounced function has properly executed its code.
For this, use the `promise` option:

```javascript
const getTheCatDebounced = debounce(getTheCat, { promise: true });

try {
    await getTheCatDebounced();
    console.log("The cat is here");
} catch (error) {
    if (error instanceof Error && error.message === "cancelled") {
        console.debug("The debounce was cancelled");
    } else {
        console.error("🐕");
    }
}
```

In order to avoid memory leaks, every time a new call is made, the previous promise is rejected with an `Error` containing the message `"cancelled"`.

## Cancellation

Sometimes we also want to be able to cancel debounced calls manually.
For this you can just use the `cancel()` method on the debounced function:

```javascript
const getTheCatDebounced = debounce(getTheCat, { promise: true });
getTheCatDebounced();

// Wait no actually stop everything !!!
getTheCatDebounced.cancel();
```
