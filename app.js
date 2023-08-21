import { app, db, auth, storage } from './firebase.js'
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, updatePassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.0.0/firebase-auth.js";
import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  onSnapshot,
  addDoc,
  deleteDoc,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-firestore.js";
import {
  ref,
  uploadBytesResumable,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/10.0.0/firebase-storage.js";


const firstName = document.getElementById("firstName");
const lastName = document.getElementById("lastName");
const email = document.getElementById("email");
const password = document.getElementById("password");
const repPass = document.getElementById("repeatPassword")
const signUp = document.getElementById("signUp")
const name = document.getElementById("name")
let paswd = /^(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[^a-zA-Z0-9])(?!.-*\s).{8,35}$/
signUp?.addEventListener("click", (e) => {
  e.preventDefault();
  let lengthFirstName = firstName.value;
  let lenLastName = lastName.value
  let fullName = `${firstName.value} ${lastName.value}`;

  const repeatPassword = document.getElementById("repeatPassword")
  const password = document.getElementById("password")
  if ((lengthFirstName.length >= 3 && lengthFirstName.length <= 20) && (lenLastName.length >= 1 && lenLastName.length <= 20) && (repeatPassword.value === password.value) && (password.value.match(paswd))) {
    createUserWithEmailAndPassword(auth, email.value, password.value)
      .then(async (userCredential) => {
        try {
          const user = userCredential.user;
          await setDoc(doc(db, "signUpUsers", user.uid), {
            name: fullName,
            email: email.value,
          });
          Swal.fire({
            icon: 'success',
            title: 'User Registered Successfully',
          })
          localStorage.setItem("password", password.value)
          localStorage.setItem("uid", user.uid)
          location.href = "profile.html";
          name.innerHTML = fullName;
          firstName.value = "";
          lastName.value = "";
          email.value = "";
          repeatPassword.value = "";
          password.value = "";
          name.value = ""
        } catch (e) {
          Swal.fire({
            icon: 'error',
            title: 'Oops...',
            text: e,
          })
        }
      })

      .catch((error) => {
        const errorCode = error.code;
        const errorMessage = error.message;
        Swal.fire({
          icon: 'error',
          title: 'Oops...',
          text: errorMessage,
        })
      });
  }
  else {
    Swal.fire({
      icon: 'error',
      title: 'Oops...',
      text: 'First name contain atleast 3 words\nLast name contains atleast 1 words\nPassword contain atleast 8 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character',
    })
  }
})

const sigIn = document.getElementById("signIn")
const signPassword = document.getElementById("signPassword")
const signEmail = document.getElementById("signEmail")
sigIn?.addEventListener("click", () => {
  signInWithEmailAndPassword(auth, signEmail.value, signPassword.value)
    .then(async (userCredential) => {
      // Signed in
      const user = userCredential.user;
      localStorage.setItem("uid", user.uid);
      localStorage.setItem("password", signPassword.value)
      location.href = "profile.html"
    })
    .catch((error) => {
      const errorCode = error.code;
      const errorMessage = error.message;
      Swal.fire({
        icon: 'error',
        title: 'Oops...',
        text: errorMessage,
      })
    });
})

const changeName = document.getElementById("changeName")
const logo = document.getElementById("logo")
let fr = true
logo?.addEventListener("click", () => {
  if (fr) {
    changeName.disabled = false;
    fr = false;
    changeName.style.border = "1px solid black"
  }
  else {
    changeName.disabled = true;
    fr = true
    changeName.style.border = "none"
  }
})


const uploadFile = (file) => {
  return new Promise((resolve, reject) => {
    if (file) {
      if (
        file.type.slice(6) == "png" ||
        file.type.slice(6) == "jpeg" ||
        file.type.slice(6) == "jpg"
      ) {
        let name = file.name;
        const mountainsRef = ref(storage, `images/${name}`);
        const uploadTask = uploadBytesResumable(mountainsRef, file);
        uploadTask.on(
          "state_changed",
          (snapshot) => {
            const progress =
              (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log("Upload is " + progress + "% done");
            switch (snapshot.state) {
              case "paused":
                console.log("Upload is paused");
                break;
              case "running":
                console.log("Upload is running");
                break;
            }
          },
          (error) => {
            reject(error);
          },
          () => {
            getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
              resolve(downloadURL);
            });
          }
        );
      } else {
        Swal.fire({
          icon: "error",
          title: "Oops...",
          text: "Image should be in 'PNG, JPEG or JPG' format",
        });
      }
    }
  });
};


const fileInput = document.getElementById("file-input");

fileInput?.addEventListener("change", async () => {
  if (
    fileInput.files[0].type === "image/jpg" ||
    fileInput.files[0].type === "image/png" ||
    fileInput.files[0].type === "image/jpeg"
  ) {
    try {
      userProfile.src = URL.createObjectURL(fileInput.files[0]);
    } catch (err) {
      console.log();
    }
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Image should be in 'PNG, JPEG or JPG' format",
    });
  }
});

const updateProfile = document.getElementById("update");
const userProfile = document.getElementById("userProfile")
const nameProfile = document.getElementById("nameProfile")


updateProfile?.addEventListener("click", async () => {
  let uid = localStorage.getItem("uid");
  let oldpass = document.getElementById("old-password")
  let newPass = document.getElementById("new-password")
  let repeatPassword = document.getElementById("repeat-password")
  const password = (localStorage.getItem('password'));

  if (password === oldpass.value && newPass.value.match(paswd) && newPass.value === repeatPassword.value) {
    const user = auth.currentUser;
    const newPassword = newPass.value;

    updatePassword(user, newPassword).then(() => {
      console.log("password updated")
      localStorage.setItem("password", newPass.value)
    }).catch((error) => {
      Swal.fire({
        icon: "error",
        title: "Oops...",
        text: error,
      });
    });
    let nameProfile = document.getElementById("name")
    if (fileInput.files[0]) {
      const imageUrl = await uploadFile(fileInput.files[0]);
      const washingtonRef = doc(db, "signUpUsers", uid);
      await updateDoc(washingtonRef, {
        name: changeName.value,
        picture: imageUrl,
      });
    } else {
      const washingtonRef = doc(db, "signUpUsers", uid);
      await updateDoc(washingtonRef, {
        name: changeName.value,
      });
    }
    Swal.fire({
      icon: "success",
      title: "User updated successfully",
    });
  }
  else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Password contain atleast 8 characters which contain at least one lowercase letter, one uppercase letter, one numeric digit, and one special character and must be match with repeat password",
    });
  }
});
const uid = localStorage.getItem("uid");
if (uid) {
  const docRef = doc(db, "signUpUsers", uid);
  const docSnap = await getDoc(docRef);
  if (docSnap.exists()) {
    if (location.pathname === "/profile.html") {
      console.log(docSnap.data().name + "  " + docSnap.data().email);
      nameProfile.innerHTML = docSnap.data().name
      changeName.value = docSnap.data().name;
      if (docSnap.data().picture != undefined) {
        userProfile.src = docSnap.data().picture;
      }
    } else if (docSnap.data().picture == "") {
      changeName.innerHTML = docSnap.data().name;
      if (docSnap.data().picture) {
        userProfile.src = docSnap.data().picture;
      }
    }
  } else {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: "Something went wrong\nTry again!",
    });
  }
}



function formatAMPM(date) {
  let current = date.toJSON();
  let currentDate = current.slice(0, 10);
  var hours = date.getHours();
  var minutes = date.getMinutes();
  var ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12; // the hour '0' should be '12'
  minutes = minutes < 10 ? "0" + minutes : minutes;
  var strTime = hours + ":" + minutes + " " + ampm;
  return `${currentDate}, ${strTime}`;
}
const addBtn = document.getElementById("add")
const placeHold = document.getElementById("placeHold")
addBtn?.addEventListener("click", async () => {
  try {
    let text = document.getElementById("msg");
    let textValue = text.value.trim();
    let da = formatAMPM(new Date());
    if (textValue == "" || placeHold.value == "") {
      alert("Please write some thing at text field");
    } else {
      const docRef = await addDoc(collection(db, "blogsValues"), {
        uid,
        titel: placeHold.value,
        value: textValue,
        time: da,
      });
    }
  } catch (err) {
    console.log();
  }
})


let arr = [];
let nameBlog = document.getElementById("name")
const getTodos = () => {
  try {
    var text = document.getElementById("msg");
    var list = document.getElementById("list");
    let textValue = text.value.trim();
    onSnapshot(collection(db, "blogsValues"), (data) => {
      data.docChanges().forEach(async (change) => {
        arr.push(change.doc.id);
        if (change.type == "removed") {
          let d = document.getElementById(change.doc.id);
          d.remove();
        } else if (change.type == "added") {
          const uid = localStorage.getItem("uid");
          const docRef = doc(db, "signUpUsers", uid);
          const docSnap = await getDoc(docRef);
          name.innerHTML = docSnap.data().name;

          if (docSnap.exists() && change.doc.data().uid === uid) {
            list.insertAdjacentHTML(
              "afterbegin",
              `<li id="${change.doc.id}">
            <div class="mt-4 justify-content-center login-container">
                <div class="col-md-4">
                    <div class="card form" style="width: 70rem;">
                        <div class="card-body">
                                <div class="mb-3 blog">
                                    <div>
                                        <img id="blogProfile" src="${docSnap.data().picture}" alt="">
                                    </div>
                                    <div>
                                        <p id="blogPara">${change.doc.data().titel}</p>
                                        <div class="sub-blog">
                                            <p>${docSnap.data().name}</p>
                                            <p class="time">${change.doc.data().time}</p>
                                        </div>
                                    </div>
                                </div>
                                <div class="mb-3"> 
                                    <textarea placeholder="" id="msgBlog" cols="128" rows="5" disabled>${change.doc.data().value}</textarea>
                                </div>
                                <div class="buttonBlog">
                                    <button onclick='deleteBtn("${change.doc.id
              }")'>Delete</button>
                                    <button id="editBtn" onclick='editBtn(this,"${change.doc.id
              }")'>Edit</button>
                                </div>
                        </div>
                    </div>
                </div>
            </div>
        </li>`
            );
          } else {
            // docSnap.data() will be undefined in this case
            console.log();
          }
        }
        text.value = "";
        placeHold.value = "";
      });
    });
  } catch (e) {

  }
};
getTodos();

const deleteBtn = async (e) => {
  await deleteDoc(doc(db, "blogsValues", e));
};

var editVal = true;
const editBtn = async (e, id) => {
  var editImg = document.getElementById("editBtn");
  let msgBlog = document.getElementById("msgBlog")
  if (editVal) {
    editImg.innerHTML = "Update";
    msgBlog.disabled = false;
    editVal = false;
  } else {
    await updateDoc(doc(db, "blogsValues", id), {
      value: msgBlog.value,
    });
    editImg.innerHTML = "Edit";
    msgBlog.disabled = true;
    editVal = true;
  }
};


const logoutBtn = document.getElementById("logOut")

logoutBtn && logoutBtn.addEventListener("click", () => {
  signOut(auth)
    .then(() => {
      localStorage.clear();
      location.href = "index.html";
    })
    .catch((error) => {
      // An error happened.
    });
});

window.deleteBtn = deleteBtn;
window.editBtn = editBtn;
