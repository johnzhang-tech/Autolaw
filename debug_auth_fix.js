// Quick fix to update localStorage with fresh token
localStorage.setItem('docuai_token', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiJ0YWRlLWFkbWluLTEiLCJlbWFpbCI6ImFkbWluQHRhZGUtYWx0b3NlcmEuY29tIiwicm9sZSI6ImFkbWluIiwiaWF0IjoxNzUzMzA3NTc5LCJleHAiOjE3NTM5MTIzNzl9.knislOLRSHuRv0oIUk8E3Ef9A04ZL0fa3yvagDI4zDk');
localStorage.removeItem('docuai_logged_out');
console.log('Updated token and cleared logout flag');
location.reload();