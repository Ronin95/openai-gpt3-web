import { useState, useRef, useEffect } from "react";
import { Heading, Text, Box, Flex, Button, Textarea } from "@chakra-ui/react"
import { SSE } from "sse";

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

function App() {
  let [prompt, setPrompt] = useState("");
  let [isLoading, setIsLoading] = useState(false);
  let [result, setResult] = useState("");

  const resultRef = useRef();
  
  useEffect(() => {
    resultRef.current = result;
  }, [result]);

  let handleClearBtnClicked = () => {
    setPrompt("");
    setResult("");
  };

  let handleSubmitPromptBtnClicked = async () => {
    if (prompt != "") {
      setIsLoading(true);
      setResult("");
      let url = "https://api.openai.com/v1/completions";
      let data = {
        model: "text-davinci-003",
        prompt: prompt,
        temperature: 0.9,
        top_p: 0.95,
        max_tokens: 100,
        stream: true,
        n: 1,
      };

      let source = new SSE(url, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${API_KEY}`,
        },
        method: "POST",
        payload: JSON.stringify(data),
      });

      source.addEventListener("message", (e) => {
        if (e.data != "[DONE]") {
          let payload = JSON.parse(e.data);
          let text = payload.choices[0].text;
          if (text != "\n") {
            console.log("Text: " + text);
            resultRef.current = resultRef.current + text;
            console.log("ResultRef.current: " + resultRef.current);
            setResult(resultRef.current);
          }
        } else {
          source.close();
        }
      });

      source.addEventListener("readystatechange", (e) => {
        if (e.readyState >= 2) {
          setIsLoading(false);
        }
      });

      source.stream();

    } else {
      alert("Please insert a prompt!");
    }
  };

  let handlePromptChange = (e) => {
    let inputValue = e.target.value;
    setPrompt(inputValue);
  };

  return (
    <Flex
      width={"100vw"}
      height={"100vh"}
      alignContent={"center"}
      justifyContent={"center"}
      bgGradient="linear(to-b, orange.100, purble.300)"
    >
      <Box maxW="2xl" m="0 auto" p="20px">
        <Heading 
          as="h1"
          textAlign="center"
          fontSize="5xl"
          mt="100px"
          bgGradient="linear(to-l, #7928CA, #FF0080)"
          bgClip="text"
          >OpenAI GPT-3 answers your questions...
        </Heading>
        <Text
          fontSize="xl"
          textAlign="center"
          mt="30px"
          >
          This website was designed in React. It makes use of the OpenAI API to perform completions. The results come back in real time via SSE.
        </Text>
        <Textarea
          value={prompt}
          onChange={handlePromptChange}
          placeholder="Insert your mystery questions here ..."
          mt="30px"
          size="lg"
          >
        </Textarea>
        <Button
          isLoading={isLoading}
          loadingText="Loading ..."
          colorScheme="teal"
          size="lg"
          mt="30px"
          onClick={handleSubmitPromptBtnClicked}
          >
            Submit
        </Button>
        <Button
          colorScheme="teal"
          size="lg"
          mt="30px"
          ml="20px"
          onClick={handleClearBtnClicked}
          >
            Clear
        </Button>
        {result != "" && (
          <Box maxW="2xl" m="0 auto">
            <Heading as="h5" textAlign="left" fontSize="lg" mt="20px">
              Result:
            </Heading>
            <Text fontSize="lg" textAlign="left" mt="20px">
              {result}
            </Text>
          </Box>
        )}
      </Box>
    </Flex>
  );
}

export default App
