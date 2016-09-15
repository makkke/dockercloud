# Dockercloud

[![Circle CI](https://circleci.com/gh/cityofsurrey/dockercloud.svg?style=svg&circle-token=f548071bbc6fe1b232c2f32b197a04c7bcafa50b)](https://circleci.com/gh/CityofSurrey/dockercloud)
<a href="https://codeclimate.com/github/CityofSurrey/dockercloud"><img src="https://codeclimate.com/github/CityofSurrey/dockercloud/badges/gpa.svg" /></a>
<a href="https://codeclimate.com/github/CityofSurrey/dockercloud/coverage"><img src="https://codeclimate.com/github/CityofSurrey/dockercloud/badges/coverage.svg" /></a>

Node.js library for Docker Cloud API

## Installation

```
npm install dockercloud
```

## Usage

### Initilization

To use this class firstly you need to instantiate a new instance:
```js
import DockerCloud from 'dockercloud'

const dockerCloud = new DockerCloud('username', 'password')
```

### Methods

All methods return promises.

#### connect

Connect to DockerCloud and listen for events.
This method is required to be called before using the waitUntil* methods.

Example:
```js
await dockerCloud.connect()
const stack = await dockerCloud.findStackById('stackId')
await dockerCloud.waitUntilStackIsTerminated(stack)

```

#### disconnect

Disconnect from DockerCloud.
This method returns nothing.

#### queryStacks

The value returned by the promise will be a list of the stacks in your account.

```js
const stacks = await dockerCloud.queryStacks()
```

#### findStackById

The value returned by the promise will be the stack with the id passed.

```js
try {
  const stack = await dockerCloud.findStackById('stackId')
  // Do something with the stack
} catch (error) {
  // If the error is empty the stack isn't found (404)
}
```


#### findStackByName

Same as findStackById, but if the stack isn't found instead of rejection the promise resolves returning nothing

#### createStack

Create a new stack

```js
await dockerCloud.createStack({
  name: 'human readable name',
  nickname: 'optional nickname',
  services: [{
    "name": "hello-word",
    "image": "tutum/hello-world",
    "target_num_containers": 2
  }]
})
```

#### removeStack

Remove a stack; the parameter is the stack object.

```js
const stack = await dockerCloud.findStackById('uuid')
dockerCloud.removeStack(stack)
```

#### startStack

Start a stack; the parameter is the stack object.

```js
const stack = await dockerCloud.findStackById('uuid')
dockerCloud.startStack(stack)
```

#### getStackServices

Get the services connected to a stack; the parameter is the stack object.

```js
const stack = await dockerCloud.findStackById('uuid')
const services = dockerCloud.getStackServices(stack)
```

#### waitUntilStackIsTerminated

Wait until a stack is terminated

```js
await dockerCloud.connect()
const stack = await dockerCloud.findStackById('stackId')
await dockerCloud.waitUntilStackIsTerminated(stack)
```

#### waitUntilStackIsRunning

Wait until a stack is running

```js
await dockerCloud.connect()
const stack = await dockerCloud.findStackById('stackId')
await dockerCloud.waitUntilStackIsRunning(stack)
```

#### findServiceById

The value returned by the promise will be the service with the id passed.

```js
try {
  const stack = await dockerCloud.findServiceById('serviceId')
} catch (error) {
  // If the error is empty the service isn't found (404)
}
```

#### findServiceByName

Same as findServiceById, but if the service isn't found instead of rejection the promise resolves returning nothing

#### createService

Create a new service

```js
await dockerCloud.createService({
  "name": "hello-word",
  "image": "tutum/hello-world",
  "target_num_containers": 2
})
```

#### removeService

Remove a service; the parameter is the service object.

```js
const service = await dockerCloud.findServiceById('uuid')
dockerCloud.removeService(service)
```

#### startService

Start a service; the parameter is the service object.

```js
const service = await dockerCloud.findServiceById('uuid')
dockerCloud.startService(service)
```

#### redeployService

Redeploy a service; the parameter is the service object.

```js
const service = await dockerCloud.findServiceById('uuid')
dockerCloud.redeployService(service)
```

#### getServiceContainers

Get the containers connected to a service; the parameter is the service object.

```js
const service = await dockerCloud.findServiceById('uuid')
const containers = dockerCloud.getStackServices(service)
```

#### findContainerById

The value returned by the promise will be the container with the id passed.

```js
try {
  const stack = await dockerCloud.findContainerById('containerId')
} catch (error) {
  // If the error is empty the container isn't found (404)
}
```


#### waitUntilContainerIsStopped

Wait until a container is stopped

```js
await dockerCloud.connect()
const container = await dockerCloud.findContainerById('containerId')
await dockerCloud.waitUntilContainerIsStopped(container)
```


#### findActionById

The value returned by the promise will be the action with the id passed.

```js
try {
  const stack = await dockerCloud.findActionById('actionId')
} catch (error) {
  // If the error is empty the action isn't found (404)
}
```


#### waitUntilActionIsSuccess

Wait until an action is successful

```js
await dockerCloud.connect()
const action = await dockerCloud.findActionById('actionId')
await dockerCloud.waitUntilActionIsSuccess(action)
```

#### extractUuid

Extract the UUID from an URL

```js
const uuuid = dockerCloud.extractUuid('/api/app/v1/action/7c42003e-eb39-4adc-b5b9-cbb7607fc698/')
uuuid === '7c42003e-eb39-4adc-b5b9-cbb7607fc698'
```
