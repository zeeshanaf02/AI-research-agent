import os
import time
from typing import List, Dict, Any, Optional
import requests
import logging
import json
import re

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class LLMService:
    """
    LLM service for answering questions based on context using Groq API
    """
    
    def __init__(self, api_key: Optional[str] = None):
        """
        Initialize the LLM service
        
        Args:
            api_key: Groq API key (if None, uses environment variable)
        """
        self.api_key = api_key or os.environ.get("GROQ_API_KEY", "gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx")
        self.api_url = "https://api.groq.com/openai/v1/chat/completions"
        self.headers = {
            "Authorization": f"Bearer {self.api_key}",
            "Content-Type": "application/json"
        }
        
        # Model to use
        self.model = "llama3-70b-8192"
        
        # Template for answering questions
        self.qa_template = """You are a helpful research assistant. Your task is to provide accurate, detailed answers based on the provided context.

FORMATTING GUIDELINES:
1. Structure your response with clear sections using headings (e.g., "Introduction", "Key Findings", "Conclusion")
2. Use numbered or bulleted lists for multiple points, not asterisks (*)
3. When citing papers, include the title and a link in this format: [Paper Title](URL)
4. Use bold for important terms or concepts
5. Break long paragraphs into smaller, more digestible chunks
6. For technical content, clearly explain complex terms
7. End with a concise summary or conclusion

RESPONSE APPROACH:
- If the information in the context is sufficient, provide a comprehensive, structured response
- If the question is a simple greeting, respond in a friendly, conversational manner
- If you cannot answer based on the context, provide a helpful response based on your general knowledge

When analyzing documents, pay special attention to:
- Key findings and conclusions
- Methodologies used
- Data presented
- Author perspectives and arguments

Context:
{context}

Question:
{question}

Remember to provide a well-structured answer with proper formatting and citations."""
    
    def answer_question(self, question: str, context: str) -> str:
        """
        Answer a question based on context using Groq API
        
        Args:
            question: Question to answer
            context: Context for answering the question
            
        Returns:
            Answer to the question
        """
        try:
            # Log the question for debugging
            logger.info(f"Processing question: {question[:100]}...")
            
            # Format the prompt
            prompt = self.qa_template.format(context=context, question=question)
            
            # Prepare the API request with improved parameters
            payload = {
                "model": self.model,
                "messages": [
                    {"role": "system", "content": "You are a helpful research assistant that provides accurate, well-structured answers with proper citations."},
                    {"role": "user", "content": prompt}
                ],
                "temperature": 0.2,  # Lower temperature for more factual responses
                "max_tokens": 2048,   # Increased token limit for more comprehensive answers
                "top_p": 0.95        # Slightly reduced for more focused responses
            }
            
            # Make API request to Groq with retry logic
            max_retries = 3
            retry_count = 0
            
            while retry_count < max_retries:
                try:
                    response = requests.post(
                        self.api_url, 
                        headers=self.headers, 
                        json=payload,
                        timeout=30  # Add timeout to prevent hanging requests
                    )
                    
                    if response.status_code == 200:
                        # Extract the generated text
                        result = response.json()
                        if "choices" in result and len(result["choices"]) > 0:
                            answer = result["choices"][0]["message"]["content"]
                            
                            # Post-process the answer to ensure proper formatting
                            answer = self._post_process_answer(answer, question)
                            
                            logger.info(f"Successfully generated answer of length {len(answer)}")
                            return answer
                        
                        logger.warning("API returned 200 but no valid choices in response")
                        break
                    
                    elif response.status_code == 429:  # Rate limit
                        retry_count += 1
                        wait_time = 2 ** retry_count  # Exponential backoff
                        logger.warning(f"Rate limited. Retrying in {wait_time} seconds...")
                        time.sleep(wait_time)
                    
                    else:
                        logger.error(f"API error: {response.status_code} - {response.text}")
                        break
                        
                except requests.exceptions.RequestException as e:
                    retry_count += 1
                    logger.warning(f"Request failed: {e}. Retry {retry_count}/{max_retries}")
                    time.sleep(1)
            
            # If we get here, all retries failed or there was a non-retryable error
            logger.error("Failed to get response from LLM API after retries")
            return self._fallback_answer(question, context)
            
        except Exception as e:
            logger.error(f"Error answering question: {e}")
            return self._fallback_answer(question, context)
            
    def _post_process_answer(self, answer: str, question: str) -> str:
        """
        Post-process the answer to ensure proper formatting
        
        Args:
            answer: Raw answer from the LLM
            question: Original question
            
        Returns:
            Processed answer
        """
        # Replace multiple asterisks with proper bullet points if they're being used as list markers
        answer = re.sub(r'^\s*\*\s+', '• ', answer, flags=re.MULTILINE)
        
        # Ensure proper heading formatting (add space after # if missing)
        answer = re.sub(r'(^|\n)#{1,6}([^#\s])', r'\1\2 ', answer)
        
        # If the answer doesn't start with a heading, add one based on the question
        if not answer.lstrip().startswith('#'):
            # Extract main topic from question
            question_words = question.strip('?!.').split()
            topic = ' '.join(question_words[:min(5, len(question_words))])
            
            # Only add heading if answer is substantial
            if len(answer) > 100:
                answer = f"# Response to: {topic}...\n\n{answer}"
        
        return answer
    
    def _fallback_answer(self, question: str, context: str) -> str:
        """Fallback method when API fails"""
        try:
            # Extract keywords from the question
            keywords = self._extract_keywords(question.lower())
            
            # Find relevant sentences in the context
            relevant_sentences = self._find_relevant_sentences(context, keywords)
            
            if relevant_sentences:
                # Generate a simple answer based on the most relevant sentences
                answer = self._generate_simple_answer(question, relevant_sentences)
                logger.info(f"Generated fallback answer for question: {question}")
                return answer
            else:
                logger.info(f"No relevant information found for question: {question}")
                return "I don't have enough information to answer this question."
        except Exception as e:
            logger.error(f"Error in fallback answering: {e}")
            return "I'm sorry, I encountered an error while trying to answer your question."
    
    def _extract_keywords(self, text: str) -> List[str]:
        """Extract keywords from text"""
        # Remove common stop words
        stop_words = {'a', 'an', 'the', 'and', 'or', 'but', 'if', 'because', 'as', 'what',
                     'when', 'where', 'how', 'why', 'which', 'who', 'whom', 'this', 'that',
                     'these', 'those', 'is', 'are', 'was', 'were', 'be', 'been', 'being',
                     'have', 'has', 'had', 'do', 'does', 'did', 'can', 'could', 'will',
                     'would', 'shall', 'should', 'may', 'might', 'must', 'to', 'of', 'in',
                     'for', 'on', 'by', 'at', 'with', 'about', 'against', 'between', 'into'}
        
        # Split text into words and remove stop words
        words = re.findall(r'\b\w+\b', text.lower())
        keywords = [word for word in words if word not in stop_words and len(word) > 2]
        
        return keywords
    
    def _find_relevant_sentences(self, context: str, keywords: List[str]) -> List[str]:
        """Find sentences in the context that contain keywords"""
        # Split context into sentences
        sentences = re.split(r'(?<=[.!?])\s+', context)
        
        # Score each sentence based on keyword matches
        scored_sentences = []
        for sentence in sentences:
            score = sum(1 for keyword in keywords if keyword.lower() in sentence.lower())
            if score > 0:
                scored_sentences.append((sentence, score))
        
        # Sort by score (descending)
        scored_sentences.sort(key=lambda x: x[1], reverse=True)
        
        # Return top sentences (up to 5)
        return [sentence for sentence, score in scored_sentences[:5]]
    
    def _generate_simple_answer(self, question: str, sentences: List[str]) -> str:
        """Generate a simple answer from relevant sentences"""
        # Check question type
        question_lower = question.lower()
        
        if any(question_lower.startswith(w) for w in ['what', 'who', 'when', 'where', 'why', 'how']):
            # For WH questions, use the most relevant sentence
            if sentences:
                return sentences[0]
            
        elif any(question_lower.startswith(w) for w in ['is', 'are', 'was', 'were', 'do', 'does', 'did', 'can', 'could', 'will', 'would']):
            # For yes/no questions, try to determine if the answer is yes or no
            if sentences:
                # Simple heuristic: if the sentence contains negation, answer might be "no"
                if any(neg in sentences[0].lower() for neg in ['not', 'no', "n't", 'never']):
                    return "Based on the information, no. " + sentences[0]
                else:
                    return "Based on the information, yes. " + sentences[0]
        
        # Default: combine the relevant sentences
        if sentences:
            return " ".join(sentences)
        
        return "I don't have enough information to answer this question."
    
    def format_context_from_documents(self, documents: List[Dict[str, Any]]) -> str:
        """
        Format documents into a context string
        
        Args:
            documents: List of documents with content and metadata
            
        Returns:
            Formatted context string
        """
        context_parts = []
        
        for i, doc in enumerate(documents):
            source = doc.get("metadata", {}).get("source", "Unknown")
            page = doc.get("metadata", {}).get("page", "")
            page_info = f" (Page {page})" if page else ""
            
            context_parts.append(f"[Document {i+1}: {source}{page_info}]\n{doc['content']}\n")
        
        return "\n".join(context_parts)
    
    def format_context_from_papers(self, papers: List[Dict[str, Any]]) -> str:
        """
        Format papers into a context string
        
        Args:
            papers: List of papers with title, authors, summary
            
        Returns:
            Formatted context string
        """
        context_parts = []
        
        for i, paper in enumerate(papers):
            authors = ", ".join(paper.get("authors", []))
            source = paper.get("source", "Unknown")
            url = paper.get("url", "")
            
            # Include URL in the context for citation
            paper_info = (
                f"[Paper {i+1}: {paper['title']}]\n"
                f"Authors: {authors}\n"
                f"Source: {source}\n"
                f"URL: {url}\n"
                f"Summary: {paper['summary']}\n"
            )
            
            context_parts.append(paper_info)
        
        return "\n".join(context_parts)