// import axios from "axios";
// import { saveImage } from "./fileHelper";

// const newAvatar = (firstName: string, lastName: string) => {
//   const formattedName = `${firstName}+${lastName}`;
//   const imageName: string = `${new Date().toISOString()}--${formattedName}`;
//   let error;
//   axios(
//     `https://ui-avatars.com/api/?background=0D8ABC&color=fff&name=${formattedName}`
//   )
//     .then((imageData) => {
//       saveImage(imageName, imageData);
//       return imageName;
//     })
//     .catch((err) => {
//       error = err;
//     });
//   if (error) {
//     throw error;
//   }
//   return `images/${formattedName}`;
// };

// export default newAvatar;
