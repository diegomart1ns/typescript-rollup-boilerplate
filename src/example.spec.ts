import { returnMyName as BoilerplateExample } from './example-modules';

describe('Boilerplate Example', () => {
  it('Should return name passed as arguments', () => {
    expect(BoilerplateExample('testString')).toEqual('testString')
  })
});
