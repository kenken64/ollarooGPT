#!/usr/bin/env bash

ollama serve &
sleep 10
ollama pull mistral-nemo
sleep 10
ollama pull minicpm-v