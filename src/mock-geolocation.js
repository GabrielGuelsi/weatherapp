export default {
  requestAuthorization: () => Promise.resolve('granted'),
  getCurrentPosition: (success, error, options) => {
    if (!navigator.geolocation) {
      error({ code: 'UNAVAILABLE', message: 'Geolocation not available' });
      return;
    }
    
    navigator.geolocation.getCurrentPosition(success, error, options);
  }
}; 