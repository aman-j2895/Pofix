const {onSchedule} = require("firebase-functions/v2/scheduler");
const {getFirestore} = require("firebase-admin/firestore");
const nodemailer = require("nodemailer");
const admin = require("firebase-admin");

admin.initializeApp();
const db = getFirestore();
const longString = "qzzc dbzn";

// Configure Nodemailer with your email service
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: "amanj02895@gmail.com", // Sender email
    pass: longString +
     "jodk cdzf", // Use an App Password, not your actual password
  },
});

exports.sendEmailEveryMinute = onSchedule("* * * * *", async () => {
  try {
    const activeWorkflows = await db
        .collection("active_workflow")
        .where("hasCompleted", "==", false)
        .get();

    for (const activeWorkflow of activeWorkflows.docs) {
      const workflowData = activeWorkflow.data();
      const givenTime = new Date(workflowData.startTime._seconds * 1000);
      const currentTime = new Date();
      const hoursPassed = (currentTime - givenTime) / (1000 * 60 * 60);
      const candidateId = workflowData.candidate_id;

      const workflowDoc = await db.collection("workflow").
          doc(workflowData.workflow_id).get();
      const actions = workflowDoc.data().ActionJSON;
      const totalActions = actions.length;
      const completedActions = workflowData.completedActions || [];

      for (const action of actions) {
        if (hoursPassed >= action.Hours &&
          !completedActions.includes(action.ActionID)) {
          const actionDoc = await db.collection("actions")
              .doc(action.ActionID).get();
          const actionResponse = actionDoc.data();
          let html = actionResponse.HTML;
          let subject = actionResponse.Subject;
          const recipientType = actionResponse.To;

          const candidateDoc = await db.collection("candidate")
              .doc(candidateId).get();
          const candidateData = candidateDoc.data();
          let recipientEmail = candidateData.Email;

          const hmDoc = await db.collection("hiring_manager")
              .doc(candidateData.HM_id).get();
          if (recipientType == "hm") {
            recipientEmail = hmDoc.data().Email;
          }

          const roleDoc = await db.collection("roles")
              .doc(candidateData.role_id).get();
          const roleName = roleDoc.data().Name;


          const fixTokens = {
            "candidate_name": candidateData.Name,
            "candidate_email": candidateData.Email,
            "hm_name": hmDoc.data().Name,
            "hm_email": hmDoc.data().Email,
            "candidate_phone": candidateData.Phone,
            "role": roleName,
          };

          const tokensDoc = await db.collection("tokens").get();
          for (const tokenDoc of tokensDoc.docs) {
            const token = tokenDoc.data();
            fixTokens[token.title] = token.value;
          }

          for (const tokenName in fixTokens) {
            if (Object.prototype.hasOwnProperty.call(fixTokens, tokenName)) {
              html = html.replaceAll("{{"+tokenName+"}}", fixTokens[tokenName]);
              subject = subject.
                  replaceAll("{{"+tokenName+"}}", fixTokens[tokenName]);
            }
          }

          const mailOptions = {
            from: `"Whatfix Hirinig Team" <amanj02895@gmail.com>`,
            to: recipientEmail,
            subject,
            html: html,
          };

          try {
            await transporter.sendMail(mailOptions);
            console.log("Email sent successfully to:", recipientEmail);
          } catch (error) {
            console.error("Error sending email:", error);
          }

          completedActions.push(action.ActionID);
          const hasCompleted = totalActions === completedActions.length;

          await db.collection("active_workflow").doc(activeWorkflow.id).update({
            hasCompleted,
            completedActions,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error processing workflows:", error);
  }
});
