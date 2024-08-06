/**
 * Represents an Email object.
 * @class
 */
class Email {
    constructor(CODE, ORIGIN) {
        this.text1 = `Dein einmaliger 2-Faktor-Authentifizierungs-Code ist:\n\n`;
        this.text2 = `\n\nFalls du nicht versucht hast dich einzuloggen empfehlen wir, deine Login Daten zu ändern.\n\nFreundliche Grüsse\nTimon Fiedler (Inhaber von LevyCrypt)\n&copy; 2024 LevyCrypt | info@timondev.com`;

        this.html1 = `<div style="background:#f5f5f5">
  <div style="background-color:#f5f5f5;padding-top:80px">
    <div style="margin:0 auto;max-width:600px;background:#ffffff">
      <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%;background:#ffffff;border-top:3px solid #6f67d9" align="center" border="0">
        <tbody>
          <tr>
            <td style="text-align:center;vertical-align:top;font-size:0px;padding:40px 30px 30px 30px">
              <div aria-labelledby="mj-column-per-100" class="m_6714119318241109685mj-column-per-100" style="vertical-align:top;display:inline-block;font-size:13px;text-align:left;width:100%">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                  <tbody>
                    <tr>
                      <td style="word-break:break-word;font-size:0px;padding:0px;padding-bottom:30px" align="center">
                        <table role="presentation" cellpadding="0" cellspacing="0" style="border-collapse:collapse;border-spacing:0px" align="center" border="0">
                          <tbody>
                            <tr>
                              <td style="width:180px">
                                <a href="https://timondev.com" target="_blank">
                                  <img alt="LevyCrypt Logo" title="LevyCrypt" height="180" src="${ORIGIN}/img/logo.png" style="border:none;display:block;outline:none;text-decoration:none;width:180px;height:180px" width="180" data-bit="iit">
                                </a>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </td>
                    </tr>
                    <tr>
                      <td style="word-break:break-word;font-size:0px;padding:0px;padding-bottom:30px" align="center">
                        <div style="color:#55575d;font-family:Open Sans,Helvetica,Arial,sans-serif;font-size:22px;font-weight:700;line-height:22px">
                          Dein einmaliger 2-Faktor-Authentifizierungs-Code ist
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="word-break:break-word;font-size:0px;padding:0px;padding-bottom:35px" align="center">
                        <div style="color:#8c8c8c;font-family:Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:22px">
                        </div>
                      </td>
                    </tr>                    
                    <tr>
                      <td style="word-break:break-word;font-size:0px;padding:0px" align="center">
                        <div style="color:#8c8c8c;font-family:Roboto,Helvetica,Arial,sans-serif;font-size:14px;line-height:22px">
                          <p style="font-size:12px;line-height:18px"><big style="font:16px/18px Arial,Helvetica,sans-serif;padding:10px;background:#fefefe;border:1px solid #e3e3e3;text-align:center;display:block"><b>`;



        this.html2 = `</b></big>Falls du nicht versucht hast dich einzuloggen empfehlen wir, deine Login Daten zu ändern.</p>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div style="margin:0 auto;max-width:600px">
      <table role="presentation" cellpadding="0" cellspacing="0" style="font-size:0px;width:100%" align="center" border="0">
        <tbody>
          <tr>
            <td style="text-align:center;vertical-align:top;font-size:0px;padding:30px">
              <div aria-labelledby="mj-column-per-100" class="m_6714119318241109685mj-column-per-100" style="vertical-align:top;display:inline-block;font-size:13px;text-align:left;width:100%">
                <table role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
                  <tbody>
                    <tr>
                      <td style="word-break:break-word;font-size:0px;padding:0px;padding-bottom:10px" align="center">
                        <div style="color:#8c8c8c;font-family:Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:22px">
                          <span>Diese E-Mail wurde dir zugestellt von LevyCrypt, weil du dich für einen LevyCrypt-Account registriert hast.</span>
                          <span>Bitte lass es uns wissen, wenn du denkst, dass dir diese E-Mail nicht zugestellt hätte werden sollen.</span>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="word-break:break-word;font-size:0px;padding:0px;padding-bottom:15px" align="center">
                        <div style="color:#8c8c8c;font-family:Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:22px">
                          &copy; 2024 LevyCrypt | info@timondev.com
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="word-break:break-word;font-size:0px;padding:0px" align="center">
                        <div style="color:#8c8c8c;font-family:Roboto,Helvetica,Arial,sans-serif;font-size:12px;line-height:22px">
                          <a href="https://www.instagram.com/timon.dev/" style="text-decoration:none;color:inherit;padding:0 4px" target="_blank">
                            <img alt="Instagram Logo" src="${ORIGIN}/img/email/assets/instagram.png" style="border:none;outline:none;text-decoration:none;height:28px;width:28px" width="28" height="28" class="CToWUd" data-bit="iit">
                          </a>
                          <a href="https://github.com/Timon-D3v" style="text-decoration:none;color:inherit;padding:0 4px" target="_blank">
                            <img alt="Github Logo" src="${ORIGIN}/img/email/assets/github.png" style="border:none;outline:none;text-decoration:none;height:28px;width:28px" width="28" height="28" class="CToWUd" data-bit="iit">
                          </a>
                          <a href="https://discordapp.com/users/560914605145325596" style="text-decoration:none;color:inherit;padding:0 4px" target="_blank">
                            <img alt="Discord Logo" src="${ORIGIN}/img/email/assets/discord.png" style="border:none;outline:none;text-decoration:none;height:28px;width:28px" width="28" height="28" class="CToWUd" data-bit="iit">
                          </a>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</div>`;
        this.CODE = CODE;
        this.ORIGIN = ORIGIN;
        this.HTMLPart = this.html1 + this.CODE + this.html2;
        this.TextPart = this.text1 + this.CODE + this.text2;
    }
}



export default Email;