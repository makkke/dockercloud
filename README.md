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
  image: "tutum/hello-world",
  name: "Optional name",
  target_num_containers: 2, // Optional, default 1
  run_command: "/run.sh", // Optional, The command used to start the containers of this service, overriding the value specified in the image. (default: null)
  entrypoint: "/usr/sbin/sshd", // Optional, The command prefix used to start the containers of this service, overriding the value specified in the image. (default: null)
  container_ports: [{ // Optional, An array of objects with port information to be published in the containers for this service, which will be added to the image port information. (default: [])
    protocol: "tcp",
    inner_port: 80,
    outer_port: 80,
    published: false
  }],
  container_envvars: [{ // Optional, An array of objects with environment variables to be added in the service containers on launch (overriding any image-defined environment variables). (default: [])
    key: "DB_PASSWORD",
    value: "mypass"
  }],
  linked_to_service: [{ // Optional, An array of service resource URIs to link this service to, including the link name. (default: [])
    to_service: "/api/app/v1/service/80ff1635-2d56-478d-a97f-9b59c720e513/",
    name: "db"
  }],
  bindings: [{ // Optional, An array of bindings this service has to mount. (default: [])
    volumes_from: "/api/app/v1/service/80ff1635-2d56-478d-a97f-9b59c720e513/",
    container_path: "",
    rewritable: true,
    host_path: ""
  }],
  autorestart: "OFF", // Optional,  Whether the containers for this service should be restarted if they stop, i.e. ALWAYS (default: OFF, possible values: OFF, ON_FAILURE, ALWAYS)
  autodestroy: "OFF", // Optional, Whether the containers should be terminated if they stop, i.e. OFF (default: OFF, possible values: OFF, ON_SUCCESS, ALWAYS)
  sequential_deployment: false, // Optional, Whether the containers should be launched and scaled in sequence. (default: false)
  roles: ["global"], // Optional, A list of Docker Cloud API roles to grant the service
  privileged: false, // Optional, Whether to start the containers with Docker’s privileged flag set or not
  deployment_strategy: "EMPTIEST_NODE", // Optional, Container distribution among nodes
  tags: ["tag1","tag2"],
  autoredeploy: false, // Optional,  Whether to redeploy the containers of the service when its image is updated in Docker Cloud registry. (default: false)
  net: "bridge", // Optional, possible values: bridge, host
  pid: "host", // Optional, Set the PID (Process) Namespace mode for the containers. (default: none)
  working_dir: "/var/app/", // Optional, Working directory for running binaries within a container of this service. (default: /)
  nickname: "Optional nickname"
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
