module.exports = {
  transform: {
    '^.+\\.jsx?$': 'babel-jest', // Tells Jest to use babel-jest for .js and .jsx files
  },
  testEnvironment: 'node', // Optional: specify environment if you're running backend tests
};
