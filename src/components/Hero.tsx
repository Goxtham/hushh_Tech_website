import { useNavigate } from "react-router-dom";
import { useEffect, useState, useCallback, useRef } from "react";
import { Button, Text, Box, Container, VStack, Image, Flex, Icon, SimpleGrid, Spinner } from "@chakra-ui/react";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import config from "../resources/config/config";
import WhyChooseSection from "./WhyChooseSection";
import { Session } from "@supabase/supabase-js";
import HushhLogo from "./images/Hushhogo.png";
import { FaRobot, FaShieldAlt, FaChartLine, FaRocket, FaLock } from "react-icons/fa";
import { HiSparkles } from "react-icons/hi";
import { BsGrid3X3Gap } from "react-icons/bs";
import { MdVerifiedUser, MdTrendingUp } from "react-icons/md";

// Motion components
const MotionBox = motion(Box);
const MotionButton = motion(Button);

// Apple-like smooth animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.45,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.46, 0.45, 0.94],
    },
  },
};

const buttonHoverVariants = {
  rest: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: { duration: 0.2, ease: "easeOut" }
  },
  tap: { 
    scale: 0.98,
    transition: { duration: 0.1 }
  },
};

// Apple Design Tokens
const tokens = {
  bg: "#F5F5F7",
  surface: "#FFFFFF",
  textPrimary: "#1D1D1F",
  textSecondary: "#515154",
  textMuted: "#8E8E93",
  accent: "#0A84FF",
  gradientStart: "#00A9E0",
  gradientEnd: "#6DD3EF",
  separator: "#E5E5EA",
};

export default function Hero() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [session, setSession] = useState<Session | null>(null);
  
  // Onboarding status state (from ProfilePage logic)
  const [onboardingStatus, setOnboardingStatus] = useState<{
    hasProfile: boolean;
    isCompleted: boolean;
    currentStep: number;
    loading: boolean;
  }>({
    hasProfile: false,
    isCompleted: false,
    currentStep: 1,
    loading: true
  });
  
  useEffect(() => {
    if (config.supabaseClient) {
      config.supabaseClient.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
      });

      const { data: { subscription } } = config.supabaseClient.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription?.unsubscribe();
    }
  }, []);

  // Check user's onboarding status when logged in
  useEffect(() => {
    async function checkUserStatus() {
      if (!session?.user?.id || !config.supabaseClient) {
        setOnboardingStatus(prev => ({ ...prev, loading: false }));
        return;
      }
      
      try {
        // Check if investor_profile exists
        const { data: profile, error: profileError } = await config.supabaseClient
          .from('investor_profiles')
          .select('id, user_confirmed')
          .eq('user_id', session.user.id)
          .maybeSingle();

        // Check onboarding_data status
        const { data: onboarding, error: onboardingError } = await config.supabaseClient
          .from('onboarding_data')
          .select('is_completed, current_step')
          .eq('user_id', session.user.id)
          .maybeSingle();

        setOnboardingStatus({
          hasProfile: !!profile && !profileError,
          isCompleted: onboarding?.is_completed || false,
          currentStep: onboarding?.current_step || 1,
          loading: false
        });
      } catch (error) {
        console.error('Error checking user status:', error);
        setOnboardingStatus(prev => ({ ...prev, loading: false }));
      }
    }

    if (session?.user?.id) {
      checkUserStatus();
    } else {
      setOnboardingStatus(prev => ({ ...prev, loading: false }));
    }
  }, [session?.user?.id]);

  // Get primary CTA content based on login state
  const getPrimaryCTAContent = () => {
    // Not logged in
    if (!session) {
      return { 
        text: "Get Started", 
        action: () => navigate("/investor-profile"),
        loading: false
      };
    }
    
    // Logged in - check onboarding status
    if (onboardingStatus.loading) {
      return { text: "Loading...", action: () => {}, loading: true };
    }
    if (onboardingStatus.hasProfile || onboardingStatus.isCompleted) {
      return { 
        text: "View Your Profile", 
        action: () => navigate("/hushh-user-profile"),
        loading: false
      };
    }
    if (onboardingStatus.currentStep > 1) {
      return { 
        text: `Continue Onboarding (Step ${onboardingStatus.currentStep})`, 
        action: () => navigate(`/onboarding/step-${onboardingStatus.currentStep}`),
        loading: false
      };
    }
    return { 
      text: "Complete Your Hushh Profile", 
      action: () => navigate("/onboarding/financial-link"),
      loading: false
    };
  };

  const primaryCTA = getPrimaryCTAContent();
  const secondaryButtonText = session ? "Discover Fund A" : "Learn More";

  return (
    <>
      {/* Hero Section - Same design for both logged in and logged out */}
      <Box
        bg="#f6f6f8"
        position="relative"
        display="flex"
        flexDirection="column"
        alignItems="center"
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        {/* Mobile Container */}
        <Box
          position="relative"
          display="flex"
          w="100%"
          maxW="500px"
          flexDirection="column"
          bg="white"
          mx="auto"
          borderX="1px solid"
          borderColor="#f1f5f9"
          overflow="hidden"
        >
          <Box
            as="main"
            position="relative"
            display="flex"
            flexDirection="column"
            alignItems="center"
            px={6}
            pt={{ base: "96px", md: "116px" }}
            pb={4}
          >
            <Box
              position="absolute"
              top={0}
              left={0}
              right={0}
              h="384px"
              bgGradient="linear(to-b, #f8fafc, rgba(248,250,252,0))"
              pointerEvents="none"
            />

            <MotionBox
              initial="hidden"
              animate="visible"
              variants={containerVariants}
              display="flex"
              flexDirection="column"
              alignItems="center"
              w="100%"
              position="relative"
              zIndex={1}
            >
              <MotionBox
                display="flex"
                justifyContent="center"
                alignItems="center"
                mb={8}
                variants={logoVariants}
                position="relative"
              >
                <Box
                  position="absolute"
                  w="144px"
                  h="144px"
                  bg="rgba(20, 184, 166, 0.05)"
                  filter="blur(32px)"
                  opacity={0.4}
                  borderRadius="full"
                />
                <Flex
                  position="relative"
                  zIndex={10}
                  w="96px"
                  h="96px"
                  bg="white"
                  borderRadius="full"
                  align="center"
                  justify="center"
                  border="1px solid"
                  borderColor="#f3f4f6"
                  boxShadow="0px 8px 30px -4px rgba(15, 76, 92, 0.04)"
                  p="1px"
                >
                  <Image
                    src={HushhLogo}
                    alt="Hushh brand logo"
                    w="64px"
                    h="64px"
                    objectFit="contain"
                  />
                </Flex>
              </MotionBox>

              <MotionBox mb={3} variants={itemVariants}>
                <Text
                  maxW="320px"
                  fontSize={{ base: "30px", md: "36px" }}
                  fontWeight="800"
                  color="#0f282f"
                  lineHeight={{ base: "37.5px", md: "44px" }}
                  letterSpacing="-0.025em"
                  textAlign="center"
                >
                  Investing in the{" "}
                  <Box
                    as="span"
                    bgGradient="linear(to-r, #3a63b8, #22d3ee)"
                    bgClip="text"
                    color="transparent"
                  >
                    Future.
                  </Box>
                </Text>
              </MotionBox>

              <MotionBox mb={8} variants={itemVariants}>
                <Text
                  maxW="317px"
                  fontSize="15px"
                  fontWeight="500"
                  color="#476871"
                  lineHeight="24.38px"
                  textAlign="center"
                >
                  The AI-Powered Berkshire Hathaway. We combine AI and human expertise to invest in exceptional businesses for long-term value creation.
                </Text>
              </MotionBox>

              <MotionBox w="100%" maxW="384px" variants={itemVariants}>
                <Box
                  w="100%"
                  border="1px solid"
                  borderColor="#f3f4f6"
                  borderRadius="24px"
                  p="25px"
                  bgGradient="linear(149deg, #ffffff 0%, #f8fafc 100%)"
                  backdropFilter="blur(6px)"
                  boxShadow="0px 8px 30px 0px rgba(0, 0, 0, 0.04)"
                  position="relative"
                  overflow="hidden"
                >
                  <Box
                    position="absolute"
                    top="-64px"
                    right="-64px"
                    w="128px"
                    h="128px"
                    bg="rgba(239,246,255,0.5)"
                    filter="blur(20px)"
                    borderRadius="full"
                  />

                  <VStack spacing={4} position="relative">
                    <Flex
                      w="56px"
                      h="56px"
                      borderRadius="24px"
                      align="center"
                      justify="center"
                      bgGradient="linear(45deg, #3a63b8 0%, #60a5fa 100%)"
                      boxShadow="0px 10px 15px -3px rgba(59,130,246,0.2), 0px 4px 6px -4px rgba(59,130,246,0.2)"
                    >
                      <Icon as={HiSparkles} boxSize="22px" color="white" />
                    </Flex>

                    <VStack spacing={2}>
                      <Text
                        fontSize="18px"
                        fontWeight="700"
                        lineHeight="28px"
                        letterSpacing="-0.45px"
                        color="#0f282f"
                        textAlign="center"
                      >
                        AI + Human Hybrid
                      </Text>
                      <Text
                        maxW="242px"
                        fontSize="14px"
                        fontWeight="400"
                        lineHeight="22.75px"
                        color="#476871"
                        textAlign="center"
                      >
                        Institutional AI with seasoned human oversight for generational wealth.
                      </Text>
                    </VStack>
                  </VStack>
                </Box>
              </MotionBox>
            </MotionBox>
          </Box>

          <Box w="100%" px={5} pb={8} pt={4}>
            <VStack spacing={4} align="stretch">
              <MotionButton
                onClick={primaryCTA.action}
                h="54px"
                borderRadius="16px"
                bg="#3a63b8"
                color="white"
                fontSize="16px"
                fontWeight="600"
                letterSpacing="-0.025em"
                isDisabled={primaryCTA.loading}
                _hover={{ bg: "#355ba8" }}
                _active={{ transform: "scale(0.98)" }}
                _disabled={{ opacity: 0.7, cursor: "not-allowed" }}
                boxShadow="0px 10px 15px -3px rgba(59,130,246,0.2), 0px 4px 6px -4px rgba(59,130,246,0.2)"
                variants={buttonHoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                {primaryCTA.loading ? <Spinner size="sm" /> : primaryCTA.text}
              </MotionButton>

              <MotionButton
                onClick={() => navigate("/discover-fund-a")}
                h="54px"
                borderRadius="16px"
                bg="rgba(255,255,255,0.65)"
                backdropFilter="blur(4px)"
                border="1px solid"
                borderColor="rgba(15,76,92,0.15)"
                color="#0f4c5c"
                fontSize="16px"
                fontWeight="600"
                letterSpacing="-0.025em"
                _hover={{ bg: "rgba(255,255,255,0.85)" }}
                _active={{ bg: "rgba(255,255,255,0.9)" }}
                variants={buttonHoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                {secondaryButtonText}
              </MotionButton>
            </VStack>

            <VStack spacing={4} mt={8}>
              <Text
                fontSize="13px"
                fontWeight="700"
                lineHeight="19.5px"
                color="#476871"
                letterSpacing="1.3px"
                textTransform="uppercase"
                textAlign="center"
              >
                Secure. Private. AI-Powered
              </Text>

              <Flex align="center" justify="center" gap={3}>
                <Flex
                  align="center"
                  gap={1.5}
                  px="13px"
                  py="7px"
                  borderRadius="9999px"
                  bg="#ecfdf5"
                  border="1px solid"
                  borderColor="#d1fae5"
                >
                  <Box w="6px" h="6px" borderRadius="full" bg="#10b981" />
                  <Text
                    fontSize="10px"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                    color="#065f46"
                    lineHeight="15px"
                  >
                    SEC REGISTERED
                  </Text>
                </Flex>

                <Box w="1px" h="16px" bg="#e5e7eb" />

                <Flex
                  align="center"
                  gap={1.5}
                  px="13px"
                  py="7px"
                  borderRadius="9999px"
                  bg="#f8fafc"
                  border="1px solid"
                  borderColor="#f1f5f9"
                >
                  <Icon as={FaLock} boxSize="8px" color="#64748b" />
                  <Text
                    fontSize="10px"
                    fontWeight="700"
                    textTransform="uppercase"
                    letterSpacing="0.5px"
                    color="#475569"
                    lineHeight="15px"
                  >
                    BANK LEVEL SECURITY
                  </Text>
                </Flex>
              </Flex>
            </VStack>
          </Box>
        </Box>
      </Box>
      
      <WhyChooseSection />
      {/* Fund A Section - Exact HTML Template Match */}
      <Box 
        bg="white"
        pt={{ base: "24px", md: "32px" }} 
        pb={{ base: "32px", md: "40px" }} 
        px={6}
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        <Container maxW="500px" px={0}>
          <MotionBox
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            variants={containerVariants}
          >
            <MotionBox textAlign="center" pt={3} pb={1} variants={itemVariants}>
              <Text
                fontSize="12px"
                letterSpacing="0.12em"
                fontWeight="700"
                color="#3A63B8"
                opacity={0.8}
                textTransform="uppercase"
              >
                Investor Profile
              </Text>
            </MotionBox>

            <MotionBox textAlign="center" pb={2} variants={itemVariants}>
              <Text
                fontSize={{ base: "40px", md: "44px" }}
                fontWeight="800"
                color="#111827"
                lineHeight="tight"
                letterSpacing="-0.02em"
              >
                Fund A
              </Text>
            </MotionBox>

            <MotionBox textAlign="center" pb={6} variants={itemVariants}>
              <Text
                fontSize="17px"
                color="#4B5563"
                lineHeight="relaxed"
                fontWeight="500"
                maxW="90%"
                mx="auto"
              >
                Our flagship growth fund focusing on diversified assets across emerging tech sectors. Designed for long-term capital appreciation.
              </Text>
            </MotionBox>

            <MotionBox variants={itemVariants} mb={6}>
              <Flex
                w="100%"
                bg="#F8FAFC"
                border="1px solid"
                borderColor="#F1F5F9"
                borderRadius="24px"
                py={8}
                px={6}
                align="center"
                justify="center"
                boxShadow="0 1px 2px rgba(0,0,0,0.04)"
              >
                <Text
                  fontSize="clamp(16px, 7.2vw, 40px)"
                  fontWeight="800"
                  color="#111827"
                  textAlign="center"
                  lineHeight="tight"
                  letterSpacing="-0.02em"
                  whiteSpace="nowrap"
                >
                  Targeting{" "}
                  <Text
                    as="span"
                    bgGradient="linear(to-r, #3A63B8, #06b6d4)"
                    bgClip="text"
                    color="transparent"
                  >
                    18-23%
                  </Text>{" "}
                  net IRR*
                </Text>
              </Flex>
            </MotionBox>

            <MotionBox variants={itemVariants} mb={6}>
              <SimpleGrid columns={2} spacing={4}>
                <Flex
                  h="128px"
                  p={5}
                  bg="white"
                  border="1px solid"
                  borderColor="#F1F5F9"
                  borderRadius="12px"
                  boxShadow="0 2px 8px rgba(0,0,0,0.04)"
                  flexDirection="column"
                  align="center"
                  justify="center"
                  gap={3}
                >
                  <Flex w="48px" h="48px" borderRadius="12px" bg="#E3F2FD" align="center" justify="center">
                    <Icon as={MdTrendingUp} boxSize="24px" color="#1565C0" />
                  </Flex>
                  <Text fontSize="14px" fontWeight="600" color="#111827" textAlign="center">
                    High Growth
                  </Text>
                </Flex>

                <Flex
                  h="128px"
                  p={5}
                  bg="white"
                  border="1px solid"
                  borderColor="#F1F5F9"
                  borderRadius="12px"
                  boxShadow="0 2px 8px rgba(0,0,0,0.04)"
                  flexDirection="column"
                  align="center"
                  justify="center"
                  gap={3}
                >
                  <Flex w="48px" h="48px" borderRadius="12px" bg="#E8F5E9" align="center" justify="center">
                    <Icon as={BsGrid3X3Gap} boxSize="22px" color="#2E7D32" />
                  </Flex>
                  <Text fontSize="14px" fontWeight="600" color="#111827" textAlign="center">
                    Diversified
                  </Text>
                </Flex>

                <Flex
                  h="128px"
                  p={5}
                  bg="white"
                  border="1px solid"
                  borderColor="#F1F5F9"
                  borderRadius="12px"
                  boxShadow="0 2px 8px rgba(0,0,0,0.04)"
                  flexDirection="column"
                  align="center"
                  justify="center"
                  gap={3}
                >
                  <Flex w="48px" h="48px" borderRadius="12px" bg="#FFF3E0" align="center" justify="center">
                    <Icon as={MdVerifiedUser} boxSize="22px" color="#EF6C00" />
                  </Flex>
                  <Text fontSize="14px" fontWeight="600" color="#111827" textAlign="center">
                    Secure Assets
                  </Text>
                </Flex>

                <Flex
                  h="128px"
                  p={5}
                  bg="white"
                  border="1px solid"
                  borderColor="#F1F5F9"
                  borderRadius="12px"
                  boxShadow="0 2px 8px rgba(0,0,0,0.04)"
                  flexDirection="column"
                  align="center"
                  justify="center"
                  gap={3}
                >
                  <Flex w="48px" h="48px" borderRadius="12px" bg="#F3E5F5" align="center" justify="center">
                    <Icon as={FaRocket} boxSize="22px" color="#7B1FA2" />
                  </Flex>
                  <Text fontSize="14px" fontWeight="600" color="#111827" textAlign="center">
                    Emerging Tech
                  </Text>
                </Flex>
              </SimpleGrid>
            </MotionBox>

            <MotionBox variants={itemVariants} mb={6}>
              <VStack spacing={4} w="100%">
                <Flex
                  w="100%"
                  borderRadius="12px"
                  p={6}
                  bg="rgba(58,99,184,0.03)"
                  border="1px solid"
                  borderColor="#F1F5F9"
                  boxShadow="0 1px 2px rgba(0,0,0,0.04)"
                  flexDirection="column"
                  align="center"
                  justify="center"
                >
                  <Text
                    fontSize="12px"
                    letterSpacing="0.08em"
                    fontWeight="700"
                    color="#4B5563"
                    textTransform="uppercase"
                    mb={2}
                  >
                    Target Net IRR
                  </Text>
                  <Text
                    fontSize={{ base: "30px", md: "32px" }}
                    fontWeight="700"
                    bgGradient="linear(to-r, #3A63B8, #06b6d4)"
                    bgClip="text"
                    color="transparent"
                    lineHeight="shorter"
                  >
                    18-23%
                  </Text>
                </Flex>

                <Flex
                  w="100%"
                  borderRadius="12px"
                  p={6}
                  bg="rgba(58,99,184,0.03)"
                  border="1px solid"
                  borderColor="#F1F5F9"
                  boxShadow="0 1px 2px rgba(0,0,0,0.04)"
                  flexDirection="column"
                  align="center"
                  justify="center"
                >
                  <Text
                    fontSize="12px"
                    letterSpacing="0.08em"
                    fontWeight="700"
                    color="#4B5563"
                    textTransform="uppercase"
                    mb={2}
                  >
                    Inception
                  </Text>
                  <Text fontSize={{ base: "30px", md: "32px" }} fontWeight="700" color="#111827" lineHeight="shorter">
                    2024
                  </Text>
                </Flex>
              </VStack>
            </MotionBox>

            <MotionBox variants={itemVariants}>
              <Text
                fontSize="10px"
                color="#9ca3af"
                fontWeight="400"
                mb={5}
                textAlign="center"
                lineHeight="normal"
                px={2}
              >
                *Past performance is not indicative of future results. Investment involves risk including possible loss of principal.
              </Text>
            </MotionBox>

            <MotionBox variants={itemVariants} w="100%">
              <MotionButton
                onClick={() => navigate("/discover-fund-a")}
                w="100%"
                h="56px"
                borderRadius="12px"
                bg="#3A63B8"
                color="white"
                fontSize="18px"
                fontWeight="700"
                display="flex"
                alignItems="center"
                justifyContent="center"
                _hover={{ bg: "#355aa8" }}
                _active={{ transform: "scale(0.98)" }}
                boxShadow="0 10px 20px rgba(58,99,184,0.25)"
                variants={buttonHoverVariants}
                initial="rest"
                whileHover="hover"
                whileTap="tap"
              >
                Learn More About Fund A
              </MotionButton>
            </MotionBox>
          </MotionBox>
        </Container>
      </Box>
      
      {/* Mission CTA Section - Exact HTML Template Match */}
      <Box
        bg="#F3F4F6"
        position="relative"
        minH="100vh"
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={4}
        style={{ fontFamily: 'Manrope, sans-serif' }}
      >
        <Box
          w="100%"
          maxW="384px"
          bg="white"
          borderRadius="32px"
          border="1px solid"
          borderColor="#f3f4f6"
          boxShadow="0 10px 40px -10px rgba(0,0,0,0.08)"
          p={8}
          display="flex"
          flexDirection="column"
          alignItems="center"
          textAlign="center"
        >
          <VStack spacing={3} mb={8} w="100%" align="center">
            <Flex
              h="32px"
              w="fit-content"
              shrink={0}
              align="center"
              justify="center"
              gap={2}
              borderRadius="full"
              bg="#F0F4F8"
              px={4}
              py={1.5}
              transition="all 0.2s"
            >
              <Icon as={MdVerifiedUser} boxSize="16px" color="#3A63B8" />
              <Text
                color="#111827"
                fontSize="12px"
                fontWeight="600"
                textTransform="uppercase"
                letterSpacing="0.04em"
                lineHeight="normal"
              >
                Verified Fund
              </Text>
            </Flex>

            <Flex
              h="32px"
              w="fit-content"
              shrink={0}
              align="center"
              justify="center"
              gap={2}
              borderRadius="full"
              bg="#F0F4F8"
              px={4}
              py={1.5}
              transition="all 0.2s"
            >
              <Icon as={MdTrendingUp} boxSize="16px" color="#3A63B8" />
              <Text
                color="#111827"
                fontSize="12px"
                fontWeight="600"
                textTransform="uppercase"
                letterSpacing="0.04em"
                lineHeight="normal"
              >
                Top Rated Performance
              </Text>
            </Flex>
          </VStack>

          <VStack spacing={4} mb={10}>
            <Text
              color="#111827"
              letterSpacing="-0.02em"
              fontSize="32px"
              fontWeight="700"
              lineHeight="1.2"
            >
              Join the{" "}
              <Text
                as="span"
                bgGradient="linear(135deg, #3A63B8 0%, #06B6D4 100%)"
                bgClip="text"
                color="transparent"
              >
                Future
              </Text>{" "}
              of Investing
            </Text>
            <Text
              color="#4B5563"
              fontSize="16px"
              fontWeight="500"
              lineHeight="relaxed"
              px={2}
            >
              Secure your financial freedom with Hushh Fund A today. Experience low-risk growth tailored for you.
            </Text>
          </VStack>

          <VStack spacing={4} w="100%">
            <MotionButton
              onClick={() => navigate("/investor-profile")}
              w="100%"
              h="56px"
              borderRadius="full"
              bg="#3A63B8"
              color="white"
              fontSize="16px"
              fontWeight="600"
              letterSpacing="0.01em"
              overflow="hidden"
              _hover={{
                bg: "#2E5099",
              }}
              _active={{
                transform: "scale(0.98)",
              }}
              boxShadow="0 4px 20px rgba(58,99,184,0.3)"
              variants={buttonHoverVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              Get Started Now
            </MotionButton>

            <MotionButton
              onClick={() => navigate("/discover-fund-a")}
              w="100%"
              h="54px"
              borderRadius="full"
              bg="transparent"
              border="2px solid"
              borderColor="#3A63B8"
              color="#3A63B8"
              fontSize="16px"
              fontWeight="600"
              letterSpacing="0.01em"
              overflow="hidden"
              _hover={{
                bg: "rgba(58,99,184,0.06)",
              }}
              _active={{
                transform: "scale(0.98)",
              }}
              variants={buttonHoverVariants}
              initial="rest"
              whileHover="hover"
              whileTap="tap"
            >
              Learn More
            </MotionButton>
          </VStack>
        </Box>
      </Box>
    </>
  );
}

