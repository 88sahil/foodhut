const nodemailer = require('nodemailer')
const ejs = require('ejs')
const {convert} = require('html-to-text')

const email = class email{
    constructor(user,url){
       this.to = user.email,
       this.firstname = user.name.split(" ")[0]
       this.url = url,
       this.from = process.env.fromemail
    }
    createTransPorter(){
        return nodemailer.createTransport({
            host:process.env.Emailhost,
            port:process.env.emailport,
            auth:{
                user:process.env.emailuser,
                pass:process.env.emailpass
            }
        })
    }
    async send(templete,subject){
        let html = await ejs.renderFile(`${__dirname}/../templetes/${templete}.ejs`,{
            firstname:this.firstname,
            url:this.url,
            subject:subject
        })
        let text = convert(html,{
            wordwrap:180
        })
        const mailoption ={
            from : this.from,
            to:this.to,
            subject,
            html,
            text:this.url
        }
        await this.createTransPorter().sendMail(mailoption)
    }

    async sendLink(){
        await this.send('Password','Password ResetLink')
    }
}


module.exports = email