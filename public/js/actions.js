$(function () {
  populateActionList();
});

function showAddActionPopup() {
  $(".addNewAction").show();
}

function showUpdateActionPopup() {
  $(".updateAction").show();
}

function closeModal() {
  $(".modal").hide();
}

function updateAction(id) {
  const db = firebase.firestore();
  const my_actions = db.collection("actions").doc(id);
  my_actions.get().then((action) => {
    if (action.exists) {
      $(".updateAction input[name='subject']").val(action.data().Subject);
      $(".updateAction select[name='to']").val(action.data().To);
      $(".updateAction select[name='type']").val(action.data().Type);
      $(".updateAction input[name='name']").val(action.data().Name);
      $(".updateAction textarea[name='html']").val(action.data().HTML);
      showUpdateActionPopup();
      updation_id = id;
    }
  });
}

function addAction() {
  var subject = $(".addNewAction input[name='subject']").val();
  var to = $(".addNewAction select[name='to']").val();
  var type = $(".addNewAction select[name='type']").val();
  var name = $(".addNewAction input[name='name']").val();
  var html = $(".addNewAction textarea[name='html']").val();

  const db = firebase.firestore();
  const my_action = db.collection("actions");
  const newToken = {
    Name: name,
    Subject: subject,
    To: to,
    Type: type,
    HTML: html,
  };
  my_action
    .add(newToken)
    .then((docRef) => {
      showToast("Action added Successfully", "success", populateActionList);
      closeModal();
    })
    .catch((error) => {
      showToast(error.message, "error");
    });
}

var updation_id = "";

function updateActionById() {
  var subject = $(".updateAction input[name='subject']").val();
  var to = $(".updateAction select[name='to']").val();
  var type = $(".updateAction select[name='type']").val();
  var name = $(".updateAction input[name='name']").val();
  var html = $(".updateAction textarea[name='html']").val();

  const db = firebase.firestore();
  const my_action = db.collection("actions");
  const updatedToken = {
    Name: name,
    Subject: subject,
    To: to,
    Type: type,
    HTML: html,
  };
  my_action
    .doc(updation_id)
    .update(updatedToken)
    .then((docRef) => {
      showToast("Action updated Successfully", "success", populateActionList);
      closeModal();
    })
    .catch((error) => {
      showToast(error.message, "error");
    });
}

function removeAction(id, event) {
  if (confirm("Are you sure you want to delete this?")) {
    const db = firebase.firestore();
    const my_actions = db.collection("actions");
    const docId = id;
    console.log("deleting action", id);
    my_actions
      .doc(docId)
      .delete()
      .then(() => {
        showToast("Action removed Successfully", "success", populateActionList);
      })
      .catch((error) => {
        showToast(error.message, "error");
      });
  }
  event.preventDefault();
}

function populateActionList() {
  const db = firebase.firestore();
  const my_actions = db.collection("actions");
  my_actions.get().then((res) => {
    $("#action-type-container").html("");
    res.forEach((item) => {
     
      var tile = `
        <div style="cursor:pointer; margin-top:10px;display:inline-block;background: white; border:1px solid lightgrey; width:400px;padding:20px;position: relative;margin-right:10px;">
        <div onclick="updateAction('${item.id}')" >
        <span
                style="font-size:30px;color:rgb(235, 56, 68);vertical-align: middle;">${getIcon(item.data().Type)}</span>
        <div style="font-weight: 500;margin-top:10px;"> ${
          item.data().Name
        }</div>
            <div style="font-size: 12px; color:gray;margin-top:5px;">${
              item.data().Subject
            }</div>
            <div style="font-size: 12px; color:gray;margin-top:5px;">${
              item.data().To
            }</div>
      </div>
            <div style='cursor:pointer; position:absolute; font-size:25px; top:20px; right:20px;' onclick='removeAction("${
              item.id
            }",event)'><span class="material-symbols-outlined" style='color:grey'>
delete
</span></div>

        </div>`;
      if ($("#action-type-" + item.data().Type).length) {
        $("#action-type-" + item.data().Type).append(tile);
      } else {
        $("#action-type-container").append(`
            <div style="margin-top: 10px;" id='action-type-${item.data().Type}'>
                <div style="margin-top: 40px; font-size: 25px; font-weight: 500; margin-bottom: 20px;">${
                  item.data().Type
                }</div>
            </div>
        `);
        $("#action-type-" + item.data().Type).append(tile);
      }
    });
  });
}
