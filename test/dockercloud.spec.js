import { expect } from 'chai'
import DockerCloud from '../src/dockercloud'

describe('DockerCloud class', () => {
  describe('extractUuid function', () => {
    it('should extract uuid from resource uri', () => {
      const dockercloud = new DockerCloud()
      const resourceUri = '/api/app/v1/action/7c42003e-eb39-4adc-b5b9-cbb7607fc698/'

      expect(dockercloud.extractUuid(resourceUri)).to.equal('7c42003e-eb39-4adc-b5b9-cbb7607fc698')
    })
  })
})
