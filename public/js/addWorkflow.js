let draggedItem = null;

function removeItem(element) {
  debugger;
  element.parentElement.remove(); // Remove the dragged item from the editor
}

function drag(event) {
  event.dataTransfer.setData("text", event.target.id);
}

document
  .getElementById("dropZone")
  .addEventListener("dragover", function (event) {
    event.preventDefault();
  });

document.getElementById("dropZone").addEventListener("drop", function (event) {
  event.preventDefault();
  let data = event.dataTransfer.getData("text"); // Get ID of dragged item
  let originalItem = document.getElementById(data);

  if (originalItem) {
    let newItem = originalItem.cloneNode(true);
    newItem.removeAttribute("id"); // Prevent duplicate IDs
    newItem.setAttribute("draggable", "true");
    newItem.dataset.id = data; // Keep the original sidebar ID

    newItem.addEventListener("dragstart", reorderStart);
    newItem.addEventListener("dragover", reorderOver);
    newItem.addEventListener("drop", reorderDrop);

    this.appendChild(newItem);
  }
});

function reorderStart(event) {
  draggedItem = event.target;
  event.dataTransfer.effectAllowed = "move";
}

function reorderOver(event) {
  event.preventDefault();
  if (
    event.target.classList.contains("draggable") &&
    event.target !== draggedItem
  ) {
    let parent = event.target.parentNode;
    let bounding = event.target.getBoundingClientRect();
    let offset = bounding.y + bounding.height / 2;

    if (event.clientY - offset > 0) {
      parent.insertBefore(draggedItem, event.target.nextSibling);
    } else {
      parent.insertBefore(draggedItem, event.target);
    }
  }
}

function reorderDrop(event) {
  event.preventDefault();
}
function getOrderedWorkflow() {
  let items = document.querySelectorAll("#dropZone .draggable");
  let order = [];

  items.forEach((item) => {
    if (item.dataset.id) {
      debugger;
      order.push({
        ActionID: item.dataset.id,
        Hours: parseFloat(item.querySelector("input").value) * 24,
      }); // Get ID from the sidebar item
    }
  });

  return order;
}

function getQueryParam(param) {
  let urlParams = new URLSearchParams(window.location.search);
  return urlParams.has(param) ? urlParams.get(param) : null;
}

$(function () {
  populateActionList();
  if (getQueryParam("id")) {
    let dropZone = document.getElementById("dropZone");
    let predefinedItems = [];
    const db = firebase.firestore();
    const my_workflow = db.collection("workflow").doc(getQueryParam("id"));
    my_workflow.get().then((res) => {
      $("[name='workflow_name']").val(res.data().Name);
      res.data().ActionJSON.forEach((item,index) => {
        var id = item.ActionID;
        var Hours = item.Hours;
        const my_action = db.collection("actions").doc(id);
        my_action.get().then((response) => {
          var text = response.data().Name;
          var Type = response.data().Type;
          predefinedItems.push({id,Hours, text,Type});
          if(index+1 == res.data().ActionJSON.length){
            addPredefinedItems(predefinedItems);
          }

        });
      });
    });

  }
});


function addPredefinedItems(predefinedItems){
    
    predefinedItems.forEach((item) => {
        let newItem = document.createElement("div");
        newItem.classList.add("draggable");
        newItem.setAttribute("draggable", "true");
        newItem.dataset.id = item.id; // Keep the original ID
        Object.assign(newItem.style, {
          marginTop: "10px",
          background: "white",
          border: "1px solid lightgrey",
          width: "400px",
          padding: "5px 20px",
          position: "relative",
          marginRight: "10px",
        });
        newItem.innerHTML = `
                  <div style="font-weight: 500; margin-top:10px;">
                      <span style="position:relative; top:-3px; font-size:30px; color:rgb(235, 56, 68); vertical-align:middle;">${getIcon(item.Type)}</span> 
                      ${item.text}
                  </div>
                  <div  class='days-input' style='cursor:pointer; position:absolute; font-size:25px; top:10px; right:10px;' onclick='removeItem(this)'> <span class="material-symbols-outlined" style='color:grey'>
                delete
                </span></div>
                   <div class='days-input' style='margin-top:30px;margin-bottom:10px;display:none;'>
                          Execute after <input type='number' value=${
                            item.Hours / 24
                          } name='days' data-id='${
          item.id
        }' style='width:50px; height:20px'/> days from workflow start
                          </div>
                   `;

        newItem.addEventListener("dragstart", reorderStart);
        newItem.addEventListener("dragover", reorderOver);
        newItem.addEventListener("drop", reorderDrop);

        dropZone.appendChild(newItem);
      });
}

function populateActionList() {
  const db = firebase.firestore();
  const my_actions = db.collection("actions");

  my_actions.get().then((res) => {
    res.forEach((item) => {
      let type = item.data().Type;
      let typeId = "action-type-" + type;

      var tile = `
                <div class="draggable" draggable="true" ondragstart="drag(event)" id="${
                  item.id
                }" 
                    style="margin-top:10px; background: white; border:1px solid lightgrey; width:400px; padding:5px 20px; position: relative; margin-right:10px;">
                    <div>
                        <div style="font-weight: 500; margin-top:10px;">
                            <span style="position:relative; top:-3px; font-size:30px; color:rgb(235, 56, 68); vertical-align: middle;">${getIcon(item.data().Type)}</span> 
                            ${item.data().Name}
                        </div>
                        <div class='days-input' style='cursor:pointer; position:absolute; font-size:25px; top:10px; right:10px;' onclick='removeItem(this)'> <span class="material-symbols-outlined" style='color:grey'>
                          delete
                          </span></div>
                        <div class='days-input' style='margin-top:30px;margin-bottom:10px;display:none;'>
                        Execute after <input type='number' value=0 name='days' data-id='${
                          item.id
                        }' style='width:50px; height:20px'/> days from workflow start
                        </div>
                    </div>
                </div>`;

      if ($("#" + typeId).length) {
        $("#" + typeId + " .action-items").append(tile);
      } else {
        $("#action-type-container").append(`
                    <div id="${typeId}" class="action-category">
                        <div class="action-header" onclick="toggleCollapse('${typeId}')"
                            style="margin-top: 40px; font-size: 16px; font-weight: 500; margin-bottom: 10px; cursor: pointer;  padding: 10px; border-bottom:1px solid lightgrey">
                            ${type}
                        </div>
                        <div class="action-items" style="display: none;">
                            ${tile}
                        </div>
                    </div>
                `);
      }
    });
  });
}

// Function to toggle collapse
function toggleCollapse(id) {
  $("[class*=action-items]").slideUp();
  $("#" + id + " .action-items").slideToggle();
}

function submitWorkflow() {
  var wName = $("[name='workflow_name']").val();
  if (wName.trim() == "") {
    $("#new_role_input").css("border", "1px solid tomato");
    showToast("Please fill the required fields", "error");
    return;
  } else {
    $("#new_role_input").css("border", "1px solid black");
  }

  var actionJSON = getOrderedWorkflow();
  if (getQueryParam("id")) {
    const db = firebase.firestore();
    const my_workflow = db.collection("workflow");
    const updatedToken = {
      Name: wName,
      ActionJSON: actionJSON,
    };
    my_workflow
      .doc(getQueryParam("id"))
      .update(updatedToken)
      .then((docRef) => {
        showToast(
          "Workflow updated Successfully",
          "success",
          redirectToWorkflow
        );
      })
      .catch((error) => {
        showToast(error.message, "error");
      });
  } else {
    const db = firebase.firestore();
    const my_workflow = db.collection("workflow");
    const newToken = {
      Name: wName,
      ActionJSON: actionJSON,
    };
    my_workflow
      .add(newToken)
      .then((docRef) => {
        showToast("Workflow added Successfully", "success", redirectToWorkflow);
 
      })
      .catch((error) => {
        showToast(error.message, "error");
      });
  }
}

function redirectToWorkflow() {
  window.location.href = "workflow.html";
}
