const nodemailer = require('nodemailer')
const hbs = require('nodemailer-express-handlebars')
const path = require('path')
 
 function sendEmail(mailOptions){

    let transporter = nodemailer.createTransport(mailOptions.to  === process.env.OUTLOOK_EMAIL ?
        {
            host: "smtp-mail.outlook.com",
            secureConnection: false,
            port: 587, 
            tls: {
                ciphers:'SSLv3'
            },
            auth: {
                user: process.env.OUTLOOK_EMAIL,
                pass: process.env.OUTLOOK_PASS
            }
        } : {
            service: 'gmail',
            port: process.env.GMAIL_PORT, 
            auth: {
                user: process.env.GMAIL_EMAIL,
                pass: process.env.GMAIL_PASS
            }
        })
    
        let handlebarsOption = {
            viewEngine: {
                partialsDir: '../nodemailerExpress/views/',
                defaultLayout: ""
            },
            viewPath: path.resolve('/home/leo/fifaProject/back/src/views/'),
            extName: '.handlebars'
        }
    
        transporter.use('compile', hbs(handlebarsOption))
    
        transporter.sendMail(mailOptions, async (err, data) => {
            if(await data){
                console.log('sucessfully sent')
       
            } 
            else {
                console.log(err)
                return res.send()
            }      
        })

}

module.exports = { sendEmail }