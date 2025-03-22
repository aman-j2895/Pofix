$(function () {
  populateSelectBox();
  refreshCandidates();
});

function showAddCandidatePopup() {
  $(".addCandidate").show();
}

function closeModal() {
  $(".modal").hide();
}

function populateSelectBox() {
  popuplateRoles();
  populateHiringManager();
}

function popuplateRoles() {
  const db = firebase.firestore();
  const my_roles = db.collection("roles");
  my_roles.get().then((res) => {
    res.forEach((item) => {
      $('select[name="role"]').append(
        `<option value="${item.id}">${item.data().Name}</option>`
      );
    });
  });
}

function populateHiringManager() {
  const db = firebase.firestore();
  const my_hm = db.collection("hiring_manager");
  my_hm.get().then((res) => {
    res.forEach((item) => {
      $('select[name="HM"]').append(
        `<option value="${item.id}">${item.data().Name}</option>`
      );
    });
  });
}

function addNewCandidate() {
  var email = $("input[name='Email']").val();
  var hm_id = $("select[name='HM']").val();
  var doj = $("input[name='DOJ']").val();
  var name = $("input[name='Name']").val();
  var phone = $("input[name='Phone']").val();
  var status = $("select[name='status']").val();
  var role_id = $("select[name='role']").val();

  const db = firebase.firestore();
  const my_candidate = db.collection("candidate");
  const newToken = {
    Name: name,
    Email: email,
    HM_id: hm_id,
    Phone: phone,
    Status: status,
    doj: doj,
    role_id: role_id,
  };
  my_candidate
    .add(newToken)
    .then((docRef) => {
      showToast("Candidate added Successfully", "success", refreshCandidates);
      closeModal();
    })
    .catch((error) => {
      showToast(error.message, "error");
    });
}

function refreshCandidates() {
  console.log("refreshing candidates");
  const db = firebase.firestore();
  const my_token = db.collection("candidate");
  my_token.get().then((res) => {
    $("#candidates_table tr:has(td)").remove();
    res.forEach((item) => {
      const my_roles = db.collection("roles").doc(item.data().role_id);
      my_roles.get().then((role) => {
        if (role.exists) {
          const my_hm = db.collection("hiring_manager").doc(item.data().HM_id);
          my_hm.get().then((hm) => {
            if (hm.exists) {
              addCandidateRow(
                item.data().Name,
                item.data().Email,
                item.data().Status,
                item.data().doj,
                hm.data().Name,
                hm.id,
                role.data().Name,
                role.id,
                item.data().active_workflow,
                role.data().Workflow_id,
                item.data().active_workflow,
                item.id
              );
            }
          });
        }
      });
    });
  });
}


function removeCandidate(id) {
  if (confirm("Are you sure you want to delete this?")) {
    const db = firebase.firestore();
    const my_candidate = db.collection("candidate");
    const docId = id;
    console.log("deleting candidate", id);
    my_candidate
      .doc(docId)
      .delete()
      .then(() => {
        showToast("Candidate removed Successfully", "success", refreshCandidates);
      })
      .catch((error) => {
        showToast(error.message, "error");
      });
    }
  }

function addCandidateRow(
  name,
  email,
  status,
  doj,
  hm_name,
  hm_id,
  role_name,
  role_id,
  active_workflow_id,
  workflow_id,
  active_workflow_id,
  candidate_id
) {
  var child = `
              <tr id='${candidate_id}'>
              <td style='font-weight:600'>
                ${name}
                 </td>
              <td>
                  ${email}
              </td>
              <td>              
                <div style='background:${
                  status == "in Progress"
                    ? "#ffe800"
                    : status == "Joined"
                    ? "lightgreen"
                    : "tomato"
                }; width:fit-content;padding:5px; font-size:14px; border-radius:5px'>${status}</div>
              </td>
              <td style='font-weight:600'>               
                ${hm_name}
              </td>
              <td>              
                ${doj}
              </td>
              <td style='font-weight:600'>              
                ${role_name}
              </td>
              <td style='font-weight:600'>              
                <span style='cursor:pointer;' onclick='startWorkflow("${candidate_id}","${workflow_id}","${active_workflow_id}")'> &#9654;</span> &nbsp; &nbsp; &nbsp; &nbsp;
                
                <span style='cursor:pointer;' onclick='removeCandidate("${candidate_id}")'> <span class="material-symbols-outlined" style='color:grey'>
delete
</span></span>
              </td>
              
              </tr>`;
  $("#candidates_table").append(child);
}

function startWorkflow(candidate_id, workflow_id,active_workflow_id) {
  if (!workflow_id || workflow_id == "" || (active_workflow_id !== 'undefined' && active_workflow_id != '')) {
    showToast("No workflow is linked to this candidate/role", "error");
    return;
  }

  const db = firebase.firestore();
  const my_active_workflows = db.collection("active_workflow");
  const newData = {
    candidate_id: candidate_id,
    workflow_id: workflow_id,
    startTime: firebase.firestore.FieldValue.serverTimestamp(),
    completedActions: [],
    hasCompleted: false,
  };
  my_active_workflows
    .add(newData)
    .then((docRef) => {
      const my_candidate = db.collection("candidate");
      const updatedData = {
        active_workflow : docRef.id
      };
      my_candidate
        .doc(candidate_id)
        .update(updatedData)
        .then(() => {
            showToast("Workflow started Successfully", "success", refreshCandidates);
        })
        .catch((error) => {
          showToast(error.message, "error");
        });
      
    })
    .catch((error) => {
      showToast(error.message, "error");
    });
}
