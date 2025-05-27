// @charset "UTF-8";

/*
    get 방식으로 fetch 처리하기 위한 함수
     - url: 요청 url
     - param: 요청 parameter
     - isXml: 요청 방식이 xml 인지 여부
    */
const landmarkImg = document.querySelector("#landmarkImg");
const landmarkName = document.querySelector("#landmarkName");
const landmarkAddress = document.querySelector("#landmarkAddress");
	 
	 
const getFetch = async (url, param, isXml) => {
  try {
    const queryString = new URLSearchParams(param).toString();
	console.log("getFetch 호출 : " + url + "?" + queryString);
    const response = await fetch(url + "?" + queryString);
    let result = "";
    if (isXml) {
      result = await response.text();
    } else {
      result = await response.json();
    }
    console.log("getFetch 호출결과 : " + result);
    return result;
  } catch (e) {
    console.log(e);
    throw e;
  }
};


 // post 처리를 위한 메서드로 
 
const postFetch = async (url,body) => {
    try {
        const response = await fetch(url, {
            method: "post",
            headers:{
                "Content-Type":"application/x-www-form-urlencoded",    
            },            
            body: body
        });
        
        let result =  await response.json();
        console.log("요청 URL: " + url, body, result);
        return result;
    } catch (e) {
        console.log(e);
        throw e;
    }
};

const apiFetch = async (url, {
  method = "GET",
  params = null,
  body   = null,
  headers = {}
} = {}) => {
  // 1) query string 처리 (GET, DELETE 등)
  let fullUrl = url;
  if (params && (method === "GET" || method === "DELETE")) {
    const queryString = new URLSearchParams(params).toString();
	console.log("getFetch 호출 : " + url + "?" + queryString);
    fullUrl += `?${queryString}`;
  }

  // 2) fetch 옵션 구성
  const fetchOptions = {
    method,
    headers: {
      "Content-Type": "application/json",
      ...headers
    }
  };
  // 3) body 처리 (POST, PUT, PATCH)
  if (body && method !== "GET" && method !== "DELETE") {
    fetchOptions.body = JSON.stringify(body);
  }

  // 4) 요청 및 응답 파싱
  const res = await fetch(fullUrl, fetchOptions);
  if (!res.ok) {
    const errorText = await res.text();
    throw new Error(`${res.status} ${res.statusText}: ${errorText}`);
  }
  // JSON 응답으로 가정
  return await res.json();
};



