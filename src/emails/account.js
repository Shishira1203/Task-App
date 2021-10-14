const sgMail = require("@sendgrid/mail");

sgMail.setApiKey(process.env.API_KEY);

const sendWelcomeEmail = (email,name)=> {
    sgMail.send({
        to: email,
        from: "shishir.karanth@gmail.com",
        subject: "Thank you registering to task applilcation",
        text:`Welcome to the task application ${name}. Let me know how you get along with the app.`
    })
}

const sendAccountCancellationEmail = (email,name)=> {
    sgMail.send({
        to: email,
        from: "shishir.karanth@gmail.com",
        subject: "Thank you for using the task application",
        text: `Thank you for using task application, ${name}. Let us know what we should have improved.`
    })
}


module.exports = {
    sendWelcomeEmail,sendAccountCancellationEmail
}