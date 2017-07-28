# Load queue 
Designed to allow running task in a queue with parallel support. Can be used for image (package) or file loading.

* Small library: 6kb minified.
* Simple queue with custom task defined with simple function

**Queues types**:

1. **Queue** - Standard load queue, the default export.
2. **CachedQueue** -- Cached load queue - when adding already loaded url, it will not use queue and call success immediately (errors are not cached)

## Install

```
npm install load-queue --save
```

### Browser

Library is exported via `UMD`. From `LoadQueue` object you can access to default queue, `Queue` and `CachedQueue`.

```html
<script src="./dist/load-queue.js" type="text/javascript"></script>

<script>
var queue = new LoadQueue.default(loaderTask)
var queue2 = new LoadQueue.Queue(loaderTask, 1)
var queue3 = new LoadQueue.CachedQueue(loaderTask, 4)
</script>
```

### Import / Require

#### Default (Queue)
```javascript
import Queue from 'load-queue'

var queue = new Queue(loaderTask)
```

#### Queue
```javascript
import {Queue} from 'load-queue'

var queue = new Queue(loaderTask)
```

#### CachedQueue
```javascript
import {CachedQueue} from 'load-queue'

var queue = new CachedQueue(loaderTask)
```

## Usage

You must provide your own task implementation. The function will accept 3 arguments:
1. entry - An QueueEntry with an url `entry.url`
2. success - A callback that accepts any custom arguments that will be passed to your custom callback
3. failure - A callback for failure that accepts an error `Error` object

```javascript
var loaderTask = function (entry, success, failure) {
        // ... loading entry.url
        setTimeout(function () {
            if (entry.url === 'url1') {
                failure(new Error('Failed!'))
            } else {
                success('my custom var', 'custom var 2')
                // or just success()
            }
        }, 1000)
    }
```

`Queue` construct accepts the task function and number of concurrent jobs that can be ran (default 1).

```javascript
var queue = new Queue(loaderTask)
// or 
var queue = new Queue(loaderTask, 2)
// or
var queue = new CachedQueue(loaderTask)
```

To add a new url to load queue, just call `add(url, success, error)`. The add method will return the `QueueEntry` that holds
given url.

```javascript
var entry = queue.add('url', function(customVar, customVar2) {
    console.log(customVar, customVar2)
}, function(error) {
  console.log(error)
})
console.log(entry.url)

// Or cancel the request
entry.cancel()
```

#### QueueEntry
You can access to `url` and the `cancel` method. For internal use you can access to running task `entry.task` and call 
success/error callbacks (the callbacks that that executes).

### Cancelling
You can cancel given url from queue at any time (even when loading - the callbacks wont be called).
There are 2 ways how to cancel request.

1. Calling `cancel(url)` on `queue` object. Like `queue.cancel('test.cz')`
2. Calling `cancel()` on `QueueEntry` from `add` function.

#### Task cancel
If your task implementation needs to handle the cancel (like cancel the http request) then the queue will use it's own
logic and then call cancel on the task. 

```javascript
var loaderTask = function (entry, success, failure) {
        // ... loading entry.url
        var timeout = setTimeout(function () {
            if (entry.url === 'url1') {
                failure(new Error('Failed!'))
            } else {
                success('my custom var', 'custom var 2')
                // or just success()
            }
        }, 5000)
        
        // Cancel the timeout
        this.cancel = function () {
            clearTimeout(timeout)
        }
    }
```