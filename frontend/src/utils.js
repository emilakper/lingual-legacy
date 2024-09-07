import axios from 'axios';
import apiUrl from './config';

const checkToken = async function checkToken(token){
    if(!token){
        return false;
    }
    try {
        const response = await axios.get(`${apiUrl}/api/v1/users/me`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        return true;
      } catch (error) {
        return false;
      }
}

export {checkToken};