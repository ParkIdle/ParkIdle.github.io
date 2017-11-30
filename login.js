function validate(){
  var username = document.getElementById("username").value;
  var password = document.getElementById("password").value;
  if ( username == "andrea" && password == "andrea"){
    alert ("Login successfully");
    window.location="userspace.html?id="+username; // Redirecting to other page.
    return true;
  }
  else{
    alert ("Wrong Credential!");
    return false;
      }
    }
