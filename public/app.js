document.addEventListener("DOMContentLoaded", (event) => {
  const app = firebase.app();
  const auth = firebase.auth();

  auth
    .setPersistence(firebase.auth.Auth.Persistence.LOCAL)
    .then(() => {
      console.log("Auth persistence enabled");

      firebase.auth().onAuthStateChanged((user) => {
        if (user) {
          // User is signed in.
          if (window.location.href.includes("index.html")) {
            window.location.href = "home.html";
          }
        } else {
          // No user is signed in.
          if (!window.location.href.includes("index.html")) {
            window.location.href = "index.html";
          }
        }
      });
    })
    .catch((error) => console.error("Error setting auth persistence:", error));
});

function logout() {
  const auth = firebase.auth();
  auth
    .signOut()
    .then(() => {})
    .catch((error) => {});
}

function googleLogin() {
  const provider = new firebase.auth.GoogleAuthProvider();
  firebase
    .auth()
    .signInWithPopup(provider)
    .then((res) => {});
}

function updateToken() {
  const db = firebase.firestore();
  const my_token = db.collection("tokens").doc("38nEKZhfNauhxDEPCWcg");
  my_token.update({ title: "company" });
}

function getData() {
    const db = firebase.firestore();

    const my_token = db.collection("tokens");
    // const my_token = db.collection('tokens').doc('38nEKZhfNauhxDEPCWcg');
    const query = my_token.where("title", "==", "company");
    query.get().then((res) => {
      // const data = res.data();
      res.forEach((item) => {
        console.log("data =>=>", item.id, item.data());
      });
    });
}


function showToast(message, type,cb){
    $('body').append(`<div class="animate__animated animate__slideInRight  toast toast_${type}">${message}</div>`);
    setTimeout(function(){
        document.querySelector('.toast').remove();    
    },2000);
    if(cb){
      cb();
    }   
    
}


function getIcon(type) {
  switch (type) {
      case 'Email':
          return `<span class="material-symbols-outlined" style="color:tomato">email</span>`;
      case 'Activity':
          return `<span class="material-symbols-outlined" style="color:green">nature_people</span>`;
      case 'Gift':
          return `<span class="material-symbols-outlined" style="color:#5c60eb">featured_seasonal_and_gifts</span>`;
      case 'Note':
          return `<span class="material-symbols-outlined" style="color:black">description</span>`;
      default:
          return `<span class="material-symbols-outlined" style="color:grey">help</span>`; // Default icon
  }
}

