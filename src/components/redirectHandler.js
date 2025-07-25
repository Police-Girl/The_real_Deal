// import { useEffect } from "react";
// import { useMsal } from "@azure/msal-react";
// import { useNavigate } from "react-router-dom";

// const RedirectHandler = () => {
//   const { instance } = useMsal();
//   const navigate = useNavigate();

//     useEffect(() => {
//     instance.handleRedirectPromise()
//       .then(response => {
//         if (response) {
//           navigate("/home");
//         }
//       })
//       .catch(e => {
//         console.error("MSAL handleRedirectPromise error", e);
//       });
//   }, [instance, navigate]);

//   // useEffect(() => {
//   //   if (!instance.getActiveAccount()) {
//   //     instance.handleRedirectPromise()
//   //       .then((response) => {
//   //         if (response) {
//   //           // console.log("Redirect response:", response);
//   //           navigate("/home");
//   //         }
//   //       })
//   //       .catch((error) => {
//   //         console.error("Redirect error:", error);
//   //       });
//   //   }
//   // }, [instance, navigate]);

//   return null;
// };

// export default RedirectHandler;