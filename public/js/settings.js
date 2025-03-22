function showUpdateModalRoles(name,selectedWorkflowId,id){
  var modal = `
  <center>
   <div class="modal">
        <div class="model_content animate__animated animate__zoomIn">
            <div style='position: absolute;top: 20px; right: 20px; cursor:pointer' onClick='closeModal()'>&#10006;</div>
            <div style="margin-top: 20px; font-size: 20px; font-weight: 500;">Update Roles</div>
            <input value="${name}" id="modal_input_1" style="margin-top:20px; font-family: 'Montserrat', sans-serif; height: 35px;text-indent: 10px;" type="text" />
            <button onclick="updateRoleWorkflow(null,'${id}','','${selectedWorkflowId}')" style="font-family: 'Montserrat', sans-serif; border:0px;margin-left: 20px; background-color: green; color: white; height: 40px; width: 150px;">Update</button>
        </div>
    </div>
    </center>
    `
  $('body').append(modal);
}

function showUpdateModalHM(name,email,id){
  var modal = `
  <center>
   <div class="modal">
        <div class="model_content animate__animated animate__zoomIn">

            <div style="margin-top: 20px; font-size: 20px; font-weight: 500;">Update HM Details</div>
            <div style='position: absolute;top: 20px; right: 20px; cursor:pointer' onClick='closeModal()'>&#10006;</div>
            <input value="${name}" id="modal_input_1" style="margin-top:20px; font-family: 'Montserrat', sans-serif; height: 35px;text-indent: 10px;" type="text" />
            <input value="${email}" id="modal_input_2" style="margin-top:20px; font-family: 'Montserrat', sans-serif; height: 35px;text-indent: 10px;" type="text" />
            <button onclick="updateHMDetails('${id}')" style="font-family: 'Montserrat', sans-serif; border:0px;margin-left: 20px; background-color: green; color: white; height: 40px; width: 150px;">Update</button>
        </div>
    </div>
    </center>
    `
  $('body').append(modal);
}


function closeModal(){
  $('.modal').remove();
}





function addRolesRow(name, value, id, workflows) {
  var selectedWorkflowId = '';
  var child = `
            <tr id='${id}'><td>${name}</td>
            <td>
                <select onchange='updateRoleWorkflow(this,"${id}","${name}")'>
                <option value="" >None</option>`;

  for (let i = 0; i < workflows.length; i++) {
    if (workflows[i].id == value) {
      selectedWorkflowId = workflows[i].id;
      child += `<option value="${workflows[i].id}" selected>${workflows[i].name}</option>`;
    } else {
      child += `<option value="${workflows[i].id}">${workflows[i].name}</option>`;
    }
  }
  child += `</select>
            </td>
            <td>
              <span style='font-size:20px; cursor:pointer;' onclick='showUpdateModalRoles("${name}","${selectedWorkflowId}","${id}")' ><span class="material-symbols-outlined" style='color:grey'>
edit
</span></span>&nbsp;&nbsp;&nbsp;&nbsp;
              <span style='font-size:20px; cursor:pointer;' onclick='removeRole("${id}")' ><span class="material-symbols-outlined" style='color:grey'>
delete
</span></span>
            </td></tr>`;
  $("#roles_table").append(child);
}


function updateHMDetails(id){
 
  var name = $("#modal_input_1").val();
  var email = $("#modal_input_2").val();
  closeModal();
  
  const db = firebase.firestore();
  const my_HM = db.collection("hiring_manager");

  const docId = id; // Replace with actual document ID
  const updatedData = {
    Name: name, // Updating the title field
    Email: email, // Updating another field
  };

  my_HM
    .doc(docId)
    .update(updatedData)
    .then(() => {
      showToast(
        "HM updated successfully",
        "success",
        refreshHM
      );
    })
    .catch((error) => {
      showToast(error.message, "error");
    });
}

function updateRoleWorkflow(select, role_id, name,workflow_id) {
  if(name == ""){
    name = $("#modal_input_1").val();
    closeModal();
  }
  let selectedValue = "";
  if(select){
    selectedValue = select.value
  }else{
   selectedValue = workflow_id
  }
  const db = firebase.firestore();
  const my_roles = db.collection("roles");

  const docId = role_id; // Replace with actual document ID
  const updatedData = {
    Name: name, // Updating the title field
    Workflow_id: selectedValue, // Updating another field
  };

  my_roles
    .doc(docId)
    .update(updatedData)
    .then(() => {
      showToast(
        "Role " + name + " updated successfully",
        "success",
        refreshRoles
      );
    })
    .catch((error) => {
      showToast(error.message, "error");
    });
}

function addTokensRow(name, value, id) {
  var child = `
            <tr id='${id}'><td>${name}</td>
            <td>
                ${value}
            </td>
            <td style='font-size:20px; cursor:pointer;' onclick='removeToken("${id}")'><span class="material-symbols-outlined" style='color:grey'>
delete
</span></td></tr>`;
  $("#tokens_table").append(child);
}

function addHMRow(name, value, id) {
  var child = `
            <tr id='${id}'><td>${name}</td>
            <td>
                ${value}
            </td>
            <td>              
              <span style='font-size:20px; cursor:pointer;' onclick='showUpdateModalHM("${name}","${value}","${id}")' ><span class="material-symbols-outlined" style='color:grey'>
edit
</span></span>&nbsp;&nbsp;&nbsp;&nbsp;
              <span style='font-size:20px; cursor:pointer;' onclick='removeHM("${id}")'><span class="material-symbols-outlined" style='color:grey'>
delete
</span></span>
            </td></tr>`;
  $("#hm_table").append(child);
}

function addNewRole() {
  var role = $("#new_role_input").val();
  if (role != "") {
    const db = firebase.firestore();
    const my_roles = db.collection("roles");
    const newToken = {
      Name: role,
      Workflow_id: "",
    };
    my_roles
      .add(newToken)
      .then((docRef) => {
        showToast("Role added Successfully", "success", refreshRoles);
      })
      .catch((error) => {
        showToast(error.message, "error");
      });
   
    $("#new_role_input").css("border", "1px solid black");
  } else {
    $("#new_role_input").css("border", "1px solid tomato");
  }
}

function addNewToken() {
  var name = $("#new_token_name").val();
  var value = $("#new_token_value").val();
  if (name == "") {
    $("#new_token_name").css("border", "1px solid tomato");
    return;
  }

  if (value == "") {
    $("#new_token_value").css("border", "1px solid tomato");
    return;
  }
  $("#new_token_name").css("border", "1px solid black");
  $("#new_token_value").css("border", "1px solid black");

  const db = firebase.firestore();
  const my_token = db.collection("tokens");
  const newToken = {
    title: name,
    value: value,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  };
  my_token
    .add(newToken)
    .then((docRef) => {
      showToast("Token added Successfully", "success", refreshTokens);
    })
    .catch((error) => {
      showToast(error.message, "error");
    });
}

function addNewHM() {
  var name = $("#new_HM_name").val();
  var value = $("#new_HM_email").val();
  if (name == "") {
    $("#new_HM_name").css("border", "1px solid tomato");
    return;
  }

  if (value == "") {
    $("#new_HM_email").css("border", "1px solid tomato");
    return;
  }
  $("#new_HM_name").css("border", "1px solid black");
  $("#new_HM_email").css("border", "1px solid black");

  const db = firebase.firestore();
  const my_hm = db.collection("hiring_manager");
  const newToken = {
    Name: name,
    Email: value,
  };
  my_hm
    .add(newToken)
    .then((docRef) => {
      showToast("HM added Successfully", "success", refreshHM);
    })
    .catch((error) => {
      showToast(error.message, "error");
    });
}

$(function () {
  $(".settings-ul li").on("click", function () {
    if ($(this).hasClass("roles")) {
      $("#tokens").hide();
      $("#roles").show();
      $("#hiring_mananger").hide();
    }
    if ($(this).hasClass("tokens")) {
      $("#tokens").show();
      $("#roles").hide();
      $("#hiring_mananger").hide();
    }

    if ($(this).hasClass("hiring_mananger")) {
      $("#tokens").hide();
      $("#roles").hide();
      $("#hiring_mananger").show();
    }

    $(".settings-ul li.active").removeClass("active");
    $(this).addClass("active");
  });
  refreshTokens();
  refreshRoles();
  refreshHM();
});

function refreshTokens() {
    console.log("refreshing tokens");
    const db = firebase.firestore();
    const my_token = db.collection("tokens");
    my_token.get().then((res) => {
      $("#tokens_table tr:has(td)").remove();
      res.forEach((item) => {
        addTokensRow(item.data().title, item.data().value, item.id);
      });
    });
  }

  function refreshHM() {
    console.log("refreshing hm");
    const db = firebase.firestore();
    const my_token = db.collection("hiring_manager");
    my_token.get().then((res) => {
      $("#hm_table tr:has(td)").remove();
      res.forEach((item) => {
        addHMRow(item.data().Name, item.data().Email, item.id);
      });
    });
  }

function refreshRoles() {
  console.log("refreshing roles");
  const db = firebase.firestore();
  const my_roles = db.collection("roles");

  const my_workflows = db.collection("workflow");
  var workflows = [];
  my_workflows.get().then((res) => {
 
    res.forEach((item) => {
 
      workflows.push({ id: item.id, name: item.data().Name });
    
    });
    my_roles.get().then((res) => {
      $("#roles_table tr:has(td)").remove();
      res.forEach((item) => {
        addRolesRow(
          item.data().Name,
          item.data().Workflow_id,
          item.id,
          workflows
        );
      });
    });
  });
}

function removeToken(id) {
  if (confirm("Are you sure you want to delete this?")) {
    const db = firebase.firestore();
    const my_token = db.collection("tokens");
    const docId = id;
    console.log("deleting token", id);
    my_token
      .doc(docId)
      .delete()
      .then(() => {
        showToast("Token removed Successfully", "success", refreshTokens);
      })
      .catch((error) => {
        showToast(error.message, "error");
      });
    }
  }

  

  function removeHM(id) {
    if (confirm("Are you sure you want to delete this?")) {
    const db = firebase.firestore();
    const my_HM = db.collection("hiring_manager");
    const docId = id;
    console.log("deleting role", id);
    my_HM
      .doc(docId)
      .delete()
      .then(() => {
        showToast("HM removed Successfully", "success", refreshHM);
      })
      .catch((error) => {
        showToast(error.message, "error");
      });
    }
  }
  

  function removeRole(id) {
    if (confirm("Are you sure you want to delete this?")) {
    const db = firebase.firestore();
    const my_token = db.collection("roles");
    const docId = id;
    console.log("deleting role", id);
    my_token
      .doc(docId)
      .delete()
      .then(() => {
        showToast("Role removed Successfully", "success", refreshRoles);
      })
      .catch((error) => {
        showToast(error.message, "error");
      });
    }
  }
  