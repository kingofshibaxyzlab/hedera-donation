#!/bin/bash

# Stop on any error
set -e

# --------------------------------------------------
# Configuration
# --------------------------------------------------
DOCKER_USERNAME="${DOCKER_USERNAME:-duysy123}"
VERSION="${VERSION:-latest}"
TARGET_ARCH="${TARGET_ARCH:-amd64}"

# Project image names
API_IMAGE_NAME="hedera_hackathon_api"
WORKER_IMAGE_NAME="hedera_hackathon_worker"
UI_IMAGE_NAME="hedera_hackathon_ui"

# Paths to Docker contexts
API_PATH="../backend/hedera_donation"
WORKER_PATH="../smart-contract"
UI_PATH="../frontend"

# --------------------------------------------------
# Function: Build + Push Single-Arch
# --------------------------------------------------
# The fourth parameter, USE_TARGET, indicates whether to pass the --target flag.
build_and_push_single_arch() {
    local image_name="$1"
    local image_path="$2"
    local arch="$3"
    local use_target="$4"  # true or false
    local full_image="${DOCKER_USERNAME}/${image_name}:${VERSION}-${arch}"

    echo "------------------------------------------------"
    echo "Building single-arch image: ${full_image}"
    echo "Context path: ${image_path}"
    echo "Architecture: ${arch}"
    echo "------------------------------------------------"

    if [ "$use_target" = "true" ]; then
        docker buildx build \
            --platform "linux/${arch}" \
            --build-arg RUNNER_STAGE="runner-${arch}" \
            --target "runner-${arch}" \
            -t "${full_image}" \
            --push \
            "${image_path}" || {
                echo "Failed to build and push ${image_name} for arch=${arch}"
                exit 1
            }
    else
        docker buildx build \
            --platform "linux/${arch}" \
            -t "${full_image}" \
            --push \
            "${image_path}" || {
                echo "Failed to build and push ${image_name} for arch=${arch}"
                exit 1
            }
    fi
}

# --------------------------------------------------
# Main Script
# --------------------------------------------------
echo "===== Building images for TARGET_ARCH=${TARGET_ARCH} ====="

docker buildx create --use --name multiarch-builder || docker buildx use multiarch-builder
docker buildx inspect --bootstrap

# For Python and Node, do not use --target (assume their Dockerfiles have a single final stage)
build_and_push_single_arch "$UI_IMAGE_NAME"   "$UI_PATH"   "$TARGET_ARCH" false
build_and_push_single_arch "$API_IMAGE_NAME" "$API_PATH" "$TARGET_ARCH" false
build_and_push_single_arch "$WORKER_IMAGE_NAME" "$WORKER_PATH" "$TARGET_ARCH" false
echo "All images for arch=${TARGET_ARCH} built and pushed successfully."
