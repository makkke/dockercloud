import request from 'request'
import WebSocket from 'ws'

if (!global._babelPolyfill) {
  require('babel-polyfill')
}

const STATES = {
  SUCCESS: 'Success',
  RUNNING: 'Running',
  STOPPED: 'Stopped',
  TERMINATED: 'Terminated',
}

const EVENT_TYPES = {
  STACK: 'stack',
  SERVICE: 'service',
  CONTAINER: 'container',
  ACTION: 'action',
}

class DockerCloud {
  constructor(username, password) {
    this.credentials = {
      username,
      password,
    }

    this.appRequest = request.defaults({
      baseUrl: 'https://cloud.docker.com/api/app/v1',
      headers: {
        'Content-Type': 'application/json',
      },
      auth: { username, password },
    })
    this.auditRequest = request.defaults({
      baseUrl: 'https://cloud.docker.com/api/audit/v1',
      headers: {
        'Content-Type': 'application/json',
      },
      auth: { username, password },
    })
  }

  stacks = {
    query: this.queryStacks.bind(this),
    findById: this.findStackById.bind(this),
    findByName: this.findStackByName.bind(this),
    create: this.createStack.bind(this),
    remove: this.removeStack.bind(this),

    start: this.startStack.bind(this),

    getServices: this.getStackServices.bind(this),

    waitUntilRunning: this.waitUntilStackIsRunning.bind(this),
    waitUntilTerminated: this.waitUntilStackIsTerminated.bind(this),
  }

  services = {
    findById: this.findServiceById.bind(this),
    findByName: this.findServiceByName.bind(this),
    create: this.createService.bind(this),
    remove: this.removeService.bind(this),

    start: this.startService.bind(this),
    redeploy: this.redeployService.bind(this),

    getContainers: this.getServiceContainers.bind(this),
  }

  containers = {
    findById: this.findContainerById.bind(this),

    waitUntilStopped: this.waitUntilContainerIsStopped.bind(this),
  }

  actions = {
    findById: this.findActionById.bind(this),

    waitUntilSuccess: this.waitUntilActionIsSuccess.bind(this),
  }

  connect() {
    return new Promise((resolve) => {
      const { username, password } = this.credentials
      this.ws = new WebSocket('wss://ws.cloud.docker.com/api/audit/v1/events/', null, {
        headers: { Authorization: `Basic ${new Buffer(`${username}:${password}`).toString('base64')}` },
      })

      this.ws.on('open', () => resolve())
    })
  }

  disconnect() {
    this.ws.terminate()
  }

  // Stacks

  queryStacks() {
    return new Promise((resolve, reject) => {
      this.appRequest.get('/stack', (error, response, body) => {
        if (error) return reject(error)

        const stacks = JSON.parse(body).objects

        return resolve(stacks)
      })
    })
  }

  findStackById(id) {
    return new Promise((resolve, reject) => {
      this.appRequest.get(`/stack/${id}/`, (error, response, body) => {
        if (error) return reject(error)
        if (response.statusCode >= 300) return reject(body)

        return resolve(JSON.parse(body))
      })
    })
  }

  findStackByName(name) {
    return new Promise((resolve, reject) => {
      this.appRequest.get('/stack', (error, response, body) => {
        if (error) return reject(error)
        if (response.statusCode >= 300) return reject(body)

        const stacks = JSON.parse(body).objects
        const stack = stacks.find(x => x.name === name && x.state !== STATES.TERMINATED)

        return resolve(stack)
      })
    })
  }

  createStack(props) {
    return new Promise((resolve, reject) => {
      this.appRequest.post({
        url: '/stack/',
        body: JSON.stringify(props),
      }, (error, response, body) => {
        if (error) return reject(error)
        if (response.statusCode >= 300) return reject(body)

        const stack = JSON.parse(body)

        return resolve(stack)
      })
    })
  }

  removeStack(stack) {
    return new Promise((resolve, reject) => {
      if (stack.state === STATES.TERMINATED) {
        resolve()
      } else {
        this.appRequest.del(`/stack/${stack.uuid}/`, async (error, response, body) => {
          if (error) return reject(error)
          if (response.statusCode >= 300) return reject(body)

          const actionId = this.extractUuid(response.headers['x-dockercloud-action-uri'])
          const action = await this.findActionById(actionId)

          return resolve(action)
        })
      }
    })
  }

  startStack(stack) {
    return new Promise((resolve, reject) => {
      this.appRequest.post(`/stack/${stack.uuid}/start/`, (error, response, body) => {
        if (error) return reject(error)
        if (response.statusCode >= 300) return reject(body)

        return resolve()
      })
    })
  }

  getStackServices(stack) {
    const promises = stack.services.map(service => {
      const tokens = service.split('/')
      const serviceId = tokens[tokens.length - 2]

      return this.findServiceById(serviceId)
    })

    return Promise.all(promises)
  }

  waitUntilStackIsTerminated(stack) {
    return new Promise((resolve) => {
      if (stack.state === STATES.TERMINATED) return resolve()

      this.ws.on('message', (data) => {
        const message = JSON.parse(data)
        if (message.type === EVENT_TYPES.STACK &&
            message.state === STATES.TERMINATED &&
            message.resource_uri.includes(stack.uuid)) {
          resolve()
        }
      })
    })
  }

  waitUntilStackIsRunning(stack) {
    return new Promise((resolve) => {
      if (stack.state === STATES.RUNNING) return resolve()

      this.ws.on('message', (data) => {
        const message = JSON.parse(data)
        if (message.type === EVENT_TYPES.STACK &&
            message.state === STATES.RUNNING &&
            message.resource_uri.includes(stack.uuid)) {
          resolve()
        }
      })
    })
  }

  // Services

  findServiceById(id) {
    return new Promise((resolve, reject) => {
      this.appRequest.get(`/service/${id}/`, (error, response, body) => {
        if (error) return reject(error)
        if (response.statusCode >= 300) return reject(body)

        return resolve(JSON.parse(body))
      })
    })
  }

  findServiceByName(name) {
    return new Promise((resolve, reject) => {
      this.appRequest.get(`/service?name=${name}`, (error, response, body) => {
        if (error) return reject(error)
        if (response.statusCode >= 300) return reject(body)

        const services = JSON.parse(body).objects
        const service = services.find(x => x.state !== STATES.TERMINATED)

        return resolve(service)
      })
    })
  }

  createService(props) {
    return new Promise((resolve, reject) => {
      this.appRequest.post({
        url: '/service/',
        body: JSON.stringify(props),
      }, (error, response, body) => {
        if (error) return reject(error)
        if (response.statusCode >= 300) return reject(body)

        const service = JSON.parse(body)

        return resolve(service)
      })
    })
  }

  removeService(service) {
    return new Promise((resolve, reject) => {
      if (service.state === STATES.TERMINATED) {
        resolve()
      } else {
        this.appRequest.del(`/service/${service.uuid}/`, async (error, response, body) => {
          if (error) return reject(error)
          if (response.statusCode >= 300) return reject(body)

          const actionId = this.extractUuid(response.headers['x-dockercloud-action-uri'])
          const action = await this.findActionById(actionId)

          return resolve(action)
        })
      }
    })
  }

  startService(service) {
    return new Promise((resolve, reject) => {
      this.appRequest.post(`/service/${service.uuid}/start/`, async (error, response, body) => {
        if (error) return reject(error)
        if (response.statusCode >= 300) return reject(body)

        const actionId = this.extractUuid(response.headers['x-dockercloud-action-uri'])
        const action = await this.findActionById(actionId)

        return resolve(action)
      })
    })
  }

  redeployService(service) {
    return new Promise((resolve, reject) => {
      this.appRequest.post(`/service/${service.uuid}/redeploy/`, async (error, response, body) => {
        if (error) return reject(error)
        if (response.statusCode >= 300) return reject(body)

        const actionId = this.extractUuid(response.headers['x-dockercloud-action-uri'])
        const action = await this.findActionById(actionId)

        return resolve(action)
      })
    })
  }

  getServiceContainers(service) {
    const promises = service.containers.map(container => {
      const tokens = container.split('/')
      const containerId = tokens[tokens.length - 2]

      return this.findContainerById(containerId)
    })

    return Promise.all(promises)
  }

  // Containers

  findContainerById(id) {
    return new Promise((resolve, reject) => {
      this.appRequest.get(`/container/${id}/`, (error, response, body) => {
        if (error) return reject(error)
        if (response.statusCode >= 300) return reject(body)

        return resolve(JSON.parse(body))
      })
    })
  }

  waitUntilContainerIsStopped(container) {
    return new Promise((resolve) => {
      if (container.state === STATES.STOPPED) return resolve()

      this.ws.on('message', (data) => {
        const message = JSON.parse(data)
        if (message.type === EVENT_TYPES.CONTAINER &&
            message.state === STATES.STOPPED &&
            message.resource_uri.includes(container.uuid)) {
          resolve()
        }
      })
    })
  }

  // Actions

  findActionById(id) {
    return new Promise((resolve, reject) => {
      this.auditRequest.get(`/action/${id}/`, (error, response, body) => {
        if (error) return reject(error)
        if (response.statusCode >= 300) return reject(body)

        return resolve(JSON.parse(body))
      })
    })
  }

  waitUntilActionIsSuccess(action) {
    return new Promise((resolve) => {
      if (action.state === STATES.SUCCESS) return resolve()

      this.ws.on('message', (data) => {
        const message = JSON.parse(data)
        if (message.type === EVENT_TYPES.ACTION &&
            message.state === STATES.SUCCESS &&
            message.resource_uri.includes(action.uuid)) {
          resolve()
        }
      })
    })
  }

  extractUuid(resourceUri) {
    const tokens = resourceUri.split('/')
    const uuid = tokens[tokens.length - 2]

    return uuid
  }
}

export default DockerCloud
