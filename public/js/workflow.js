$(function () {
    populateWorkflowList();
  });
  

  function populateWorkflowList() {
    const db = firebase.firestore();
    const my_workflow = db.collection("workflow");
    $('#action-type-container').html('')

    my_workflow.get().then((res) => {
      res.forEach((item) => {
        var tile = `
          <div style="cursor:pointer; margin-top:10px;display:inline-block;background: white; border:1px solid lightgrey; width:400px;padding:20px;position: relative;margin-right:10px;">
          <div onclick="window.location.href='addWorkflow.html?id=${item.id}'" >
          <span
                  style="font-size:40px;color:rgb(235, 56, 68);vertical-align: middle;"><span class="material-symbols-outlined" style='color:grey; font-size:40px'>
account_tree
</span></span>
          <div style="font-weight: 500;margin-top:10px;"> ${
            item.data().Name
          }</div>
             
        </div>
              <div style='cursor:pointer; position:absolute; font-size:25px; top:10px; right:10px;' onclick='removeWorkflow("${
                item.id
              }",event)'> <span class="material-symbols-outlined" style='color:grey'>
delete
</span></div>
  
          </div>`;
          $("#action-type-container").append(tile);
        
      });
    });
  }
  

  
function removeWorkflow(id, event) {
    if (confirm("Are you sure you want to delete this?")) {
      const db = firebase.firestore();
      const my_workflows = db.collection("workflow");
      const docId = id;
      console.log("deleting workflow", id);
      my_workflows
        .doc(docId)
        .delete()
        .then(() => {
          showToast("Workflow removed Successfully", "success", populateWorkflowList);
        })
        .catch((error) => {
          showToast(error.message, "error");
        });
    }
    event.preventDefault();
  }
  