const {replaceElements, emailFileOf, urlOf} = require("./utils")
const nodemailer = require('nodemailer')
const configs = require("./configs")
const join = require("path").join
const fs = require('fs')

class EmailComponent {
    constructor() {
        this.transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: configs.EMAIL, 
                pass: configs.EMAIL_PASSWORD
            },
            tls: {
                rejectUnauthorized: false
            }
        })
    }

    loadTemplate(templateName, replacements) {
        const templatePath = join(__dirname, '../email_templates', `${templateName}.html`)
        let template = fs.readFileSync(templatePath, 'utf8')
        
        return replaceElements(replacements, template)
    }
    
    async sendEmail(to, root, token) {
        const url = urlOf(root, token)
        // const htmlToSend = this.loadTemplate(emailFileOf(root), { url: url })
        const htmlToSend = this.loadTemplate(emailFileOf(root), { url: url })
    
        const mailToSend = {
            from: `"PRJ-LAS" <${configs.EMAIL}>`,
            to: to,
            subject: 'Hi from the PRJ-LAS TEAM',
            html: htmlToSend
        }
    
        try {
            const emailStatus = await this.transporter.sendMail(mailToSend)
            console.log("Email status: " , emailStatus)
        } catch (error) {
            console.error('Error while sending email:', error)
        }
    }

}


module.exports = EmailComponent