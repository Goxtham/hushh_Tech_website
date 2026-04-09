import { useEffect, useState, type MouseEvent } from "react";
import {
  Box,
  Button,
  Divider,
  HStack,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Text,
  VStack,
} from "@chakra-ui/react";
import { QRCodeSVG } from "qrcode.react";
import { Eye, ExternalLink } from "lucide-react";
import { FaApple } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";

import type { WalletPreviewModel } from "../../services/walletPass";

interface WalletCardPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  preview: WalletPreviewModel | null;
  appleWalletSupported: boolean;
  appleWalletSupportMessage: string;
  onAddToAppleWallet?: () => void | Promise<void>;
  isApplePassLoading?: boolean;
  googleWalletAvailable: boolean;
  googleWalletSupportMessage: string;
  onAddToGoogleWallet?: () => void | Promise<void>;
  isGooglePassLoading?: boolean;
}

export default function WalletCardPreviewModal({
  isOpen,
  onClose,
  preview,
  appleWalletSupported,
  appleWalletSupportMessage,
  onAddToAppleWallet,
  isApplePassLoading = false,
  googleWalletAvailable,
  googleWalletSupportMessage,
  onAddToGoogleWallet,
  isGooglePassLoading = false,
}: WalletCardPreviewModalProps) {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.matchMedia !== "function") {
      return;
    }

    const mediaQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const updatePreference = () => setReducedMotion(mediaQuery.matches);

    updatePreference();

    if (typeof mediaQuery.addEventListener === "function") {
      mediaQuery.addEventListener("change", updatePreference);
      return () => mediaQuery.removeEventListener("change", updatePreference);
    }

    mediaQuery.addListener(updatePreference);
    return () => mediaQuery.removeListener(updatePreference);
  }, []);

  if (!preview) {
    return null;
  }

  const handleMouseMove = (event: MouseEvent<HTMLDivElement>) => {
    if (reducedMotion) {
      return;
    }

    const rect = event.currentTarget.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;
    const rotateY = ((offsetX / rect.width) - 0.5) * 10;
    const rotateX = (0.5 - offsetY / rect.height) * 10;

    setRotation({ x: rotateX, y: rotateY });
  };

  const handleMouseLeave = () => {
    setRotation({ x: 0, y: 0 });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size={{ base: "full", md: "xl" }} isCentered>
      <ModalOverlay bg="blackAlpha.700" backdropFilter="blur(8px)" />
      <ModalContent
        mx={{ base: 0, md: 4 }}
        my={{ base: 0, md: 8 }}
        borderRadius={{ base: 0, md: "28px" }}
        bg="#F8F5EC"
        overflow="hidden"
      >
        <ModalHeader pb={1}>Preview Card</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={8}>
          <VStack spacing={6} align="stretch">
            <VStack spacing={1} align="stretch">
              <Text fontSize="sm" color="gray.600">
                This is a browser preview of your Hushh Gold Wallet card.
              </Text>
              <Text fontSize="xs" color="gray.500">
                Add to Apple Wallet stays device-aware. Google Wallet appears only when the pass generator is healthy.
              </Text>
            </VStack>

            <Box perspective="1600px">
              <Box
                onMouseMove={handleMouseMove}
                onMouseLeave={handleMouseLeave}
                transform={
                  reducedMotion
                    ? "none"
                    : `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale3d(1.01, 1.01, 1.01)`
                }
                transition={reducedMotion ? "none" : "transform 120ms ease-out"}
                sx={{ transformStyle: "preserve-3d" }}
              >
                <Box
                  position="relative"
                  mx="auto"
                  maxW="460px"
                  aspectRatio={1.586}
                  borderRadius="28px"
                  px={{ base: 5, md: 7 }}
                  py={{ base: 5, md: 6 }}
                  bgGradient="linear(135deg, #443317 0%, #8D6B2F 34%, #D4AF37 62%, #8A6124 100%)"
                  color="#0B1120"
                  border="1px solid rgba(255,255,255,0.35)"
                  boxShadow="0 28px 80px rgba(15, 23, 42, 0.28), inset 0 1px 10px rgba(255, 255, 255, 0.35), inset 0 -24px 44px rgba(0, 0, 0, 0.2)"
                  overflow="hidden"
                >
                  <Box
                    position="absolute"
                    inset="10px"
                    borderRadius="22px"
                    border="1px solid rgba(255,255,255,0.24)"
                    pointerEvents="none"
                  />
                  <Box
                    position="absolute"
                    inset="0"
                    bg="radial-gradient(circle at 16% 14%, rgba(255,255,255,0.55), transparent 38%), radial-gradient(circle at 88% 82%, rgba(255,255,255,0.22), transparent 30%)"
                    pointerEvents="none"
                  />

                  <VStack align="stretch" h="100%" justify="space-between" spacing={4}>
                    <HStack justify="space-between" align="flex-start">
                      <VStack align="flex-start" spacing={1}>
                        <Text
                          fontSize="xs"
                          letterSpacing="0.36em"
                          fontWeight="700"
                          color="rgba(11, 17, 32, 0.58)"
                        >
                          {preview.badgeText}
                        </Text>
                        <Text fontSize={{ base: "sm", md: "md" }} fontWeight="600">
                          {preview.title}
                        </Text>
                      </VStack>
                      <Box
                        px={3}
                        py={1.5}
                        borderRadius="999px"
                        bg="rgba(255,255,255,0.18)"
                        border="1px solid rgba(255,255,255,0.28)"
                        backdropFilter="blur(8px)"
                      >
                        <Text fontSize="10px" fontWeight="700" letterSpacing="0.12em">
                          GOLD MEMBER
                        </Text>
                      </Box>
                    </HStack>

                    <VStack align="flex-start" spacing={1}>
                      <Text
                        fontSize={{ base: "2xl", md: "3xl" }}
                        fontWeight="700"
                        color="rgba(11, 17, 32, 0.9)"
                        textShadow="0 1px 0 rgba(255, 255, 255, 0.55)"
                      >
                        {preview.holderName}
                      </Text>
                      <Text fontSize="sm" color="rgba(11, 17, 32, 0.7)">
                        {preview.organizationName}
                      </Text>
                      <Text fontSize="xs" fontWeight="600" color="rgba(11, 17, 32, 0.66)">
                        Membership ID · {preview.membershipId}
                      </Text>
                    </VStack>

                    <HStack align="flex-end" justify="space-between" spacing={4}>
                      <VStack align="flex-start" spacing={2}>
                        <Box
                          px={3}
                          py={1.5}
                          borderRadius="999px"
                          bg="rgba(255,255,255,0.16)"
                          border="1px solid rgba(255,255,255,0.24)"
                        >
                          <Text fontSize="11px" fontWeight="700">
                            Investor - {preview.investmentClass}
                          </Text>
                        </Box>
                        <Text fontSize="xs" color="rgba(11, 17, 32, 0.7)">
                          {preview.email}
                        </Text>
                      </VStack>
                      <Box
                        bg="whiteAlpha.900"
                        borderRadius="18px"
                        p={3}
                        boxShadow="0 10px 24px rgba(15, 23, 42, 0.16)"
                      >
                        <QRCodeSVG
                          value={preview.qrValue}
                          size={76}
                          bgColor="#FFFFFF"
                          fgColor="#0B1120"
                          level="M"
                          includeMargin={false}
                        />
                      </Box>
                    </HStack>
                  </VStack>
                </Box>
              </Box>
            </Box>

            <HStack
              spacing={3}
              align="stretch"
              flexDir={{ base: "column", sm: "row" }}
            >
              <Box
                flex="1"
                borderRadius="20px"
                border="1px solid rgba(15,23,42,0.08)"
                bg="white"
                px={4}
                py={4}
              >
                <HStack spacing={2} mb={2} color="#0B1120">
                  <Eye size={16} />
                  <Text fontWeight="600" fontSize="sm">
                    Browser Preview
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.600">
                  This preview mirrors the same holder, class, member ID, and QR data used for the live pass.
                </Text>
              </Box>
              <Box
                flex="1"
                borderRadius="20px"
                border="1px solid rgba(15,23,42,0.08)"
                bg="white"
                px={4}
                py={4}
              >
                <HStack spacing={2} mb={2} color="#0B1120">
                  <ExternalLink size={16} />
                  <Text fontWeight="600" fontSize="sm">
                    Profile Link
                  </Text>
                </HStack>
                <Text fontSize="xs" color="gray.600" noOfLines={2}>
                  {preview.profileUrl}
                </Text>
              </Box>
            </HStack>

            <Divider borderColor="blackAlpha.200" />

            <VStack spacing={3} align="stretch">
              {appleWalletSupported ? (
                <Button
                  leftIcon={<FaApple />}
                  bg="#0B1120"
                  color="white"
                  borderRadius="16px"
                  h="48px"
                  onClick={onAddToAppleWallet}
                  isLoading={isApplePassLoading}
                  loadingText="Opening..."
                  _hover={{ bg: "#111827" }}
                >
                  Add to Apple Wallet
                </Button>
              ) : (
                <Text fontSize="sm" color="gray.600">
                  {appleWalletSupportMessage}
                </Text>
              )}

              {googleWalletAvailable ? (
                <Button
                  leftIcon={<FcGoogle />}
                  bg="white"
                  color="#0B1120"
                  border="1px solid rgba(15,23,42,0.12)"
                  borderRadius="16px"
                  h="48px"
                  onClick={onAddToGoogleWallet}
                  isLoading={isGooglePassLoading}
                  loadingText="Opening..."
                  _hover={{ bg: "#F8FAFC" }}
                >
                  Add to Google Wallet
                </Button>
              ) : (
                <Text fontSize="sm" color="gray.600">
                  {googleWalletSupportMessage}
                </Text>
              )}
            </VStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
