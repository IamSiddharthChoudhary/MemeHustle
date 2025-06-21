"use client";
import { useState } from "react";
import type React from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";
import Navbar from "../../components/Navbar";
// import TextBack from "../../components/TextBack"
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Label } from "../../components/ui/label";
import { Badge } from "../../components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs";
import {
  Upload,
  ImageIcon,
  Sparkles,
  Wand2,
  Type,
  Zap,
  Eye,
  Loader2,
  X,
  Plus,
  Brain,
  MagnetIcon as Magic,
  Lightbulb,
  RefreshCw,
} from "lucide-react";
import { useDropzone } from "react-dropzone";
import toast from "react-hot-toast";

const categories = [
  "Finance",
  "Crypto",
  "Classic",
  "Rare",
  "Emotion",
  "Gaming",
  "Sports",
  "Politics",
  "Animals",
  "Technology",
  "Food",
  "Travel",
  "Music",
  "Art",
];

const aiTemplates = [
  {
    id: "stonks",
    name: "Stonks Guy",
    description: "Classic stonks meme template",
    imageUrl: "/template/stonks.jpeg",
  },
  {
    id: "drake",
    name: "Drake Pointing",
    description: "Drake approval/disapproval format",
    imageUrl: "/template/drake.jpg",
  },
  {
    id: "distracted",
    name: "Distracted Boyfriend",
    description: "Popular choice meme template",
    imageUrl: "/template/distracted-boyfriend.jpg",
  },
  {
    id: "woman-cat",
    name: "Woman Yelling at Cat",
    description: "Confrontational meme format",
    imageUrl: "/template/woman-yelling-cat.jpg",
  },
  {
    id: "this-fine",
    name: "This is Fine",
    description: "Everything is fine dog meme",
    imageUrl: "/template/this-is-fine.jpg",
  },
  {
    id: "expanding-brain",
    name: "Expanding Brain",
    description: "Intelligence levels meme",
    imageUrl: "/template/expanding-brain.jpg",
  },
];

export default function UploadPage() {
  const { user, updateUser } = useAuth();
  const router = useRouter();

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    tags: [] as string[],
    price: 0,
    isForSale: true,
  });

  // File and AI state
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [currentTag, setCurrentTag] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState({
    titles: [] as string[],
    tags: [] as string[],
    description: "",
    category: "",
  });

  // Meme generation state
  const [memeGeneration, setMemeGeneration] = useState({
    selectedTemplate: "",
    topText: "",
    bottomText: "",
  });

  const onDrop = (acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      setUploadedFile(file);
      const url = URL.createObjectURL(file);
      setPreviewUrl(url);

      // Auto-analyze the image with AI
      analyzeImageWithAI(file);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".jpeg", ".jpg", ".png", ".gif", ".webp"],
    },
    maxFiles: 1,
    maxSize: 10 * 1024 * 1024, // 10MB
  });

  // Redirect if not logged in
  if (!user) {
    router.push("/login");
    return null;
  }

  const analyzeImageWithAI = async (file: File) => {
    setIsAnalyzing(true);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const response = await fetch("/api/ai/analyze-image", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        setAiSuggestions(data.suggestions);

        // Auto-apply category if suggested
        if (data.suggestions.category) {
          setFormData((prev) => ({
            ...prev,
            category: data.suggestions.category,
          }));
        }

        toast.success(
          "AI analysis complete! Check out the suggestions below 🤖"
        );
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("AI analysis failed:", error);
      toast.error("AI analysis failed, but you can still upload manually");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const generateMemeWithAI = async () => {
    if (!memeGeneration.selectedTemplate) {
      toast.error("Please select a template first");
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai/generate-meme", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          template: memeGeneration.selectedTemplate,
          topText: memeGeneration.topText,
          bottomText: memeGeneration.bottomText,
          style: "funny",
        }),
      });

      const data = await response.json();

      if (data.success) {
        const { memeData } = data;

        // Auto-fill form with generated content
        setFormData((prev) => ({
          ...prev,
          title: memeData.title,
          description: memeData.description,
          tags: [
            ...prev.tags,
            ...memeData.tags.filter((tag: string) => !prev.tags.includes(tag)),
          ],
        }));

        // Update the text inputs with optimized versions
        setMemeGeneration((prev) => ({
          ...prev,
          topText: memeData.optimizedTopText,
          bottomText: memeData.optimizedBottomText,
        }));

        toast.success("Meme content generated successfully! 🎨");
        toast.success(
          "Template image is ready for upload! You can now fill in the details and submit."
        );
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Meme generation failed:", error);
      toast.error("Meme generation failed, please try again");
    } finally {
      setIsGenerating(false);
    }
  };

  const generateTitleWithAI = async () => {
    setIsGenerating(true);

    try {
      const response = await fetch("/api/ai/generate-title", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          context: formData.description || formData.category || "general meme",
          style: "funny and viral",
        }),
      });

      const data = await response.json();

      if (data.success && data.titles.length > 0) {
        const randomTitle =
          data.titles[Math.floor(Math.random() * data.titles.length)];
        setFormData((prev) => ({ ...prev, title: randomTitle }));
        toast.success("AI title generated! ✨");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Title generation failed:", error);
      toast.error("Title generation failed, please try again");
    } finally {
      setIsGenerating(false);
    }
  };

  const enhanceDescriptionWithAI = async () => {
    if (!formData.title && !formData.category) {
      toast.error("Please add a title or category first");
      return;
    }

    setIsEnhancing(true);

    try {
      const response = await fetch("/api/ai/enhance-description", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formData.title,
          category: formData.category,
          tags: formData.tags,
          currentDescription: formData.description,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setFormData((prev) => ({ ...prev, description: data.description }));
        toast.success("Description enhanced with AI! 📝");
      } else {
        throw new Error(data.error);
      }
    } catch (error) {
      console.error("Description enhancement failed:", error);
      toast.error("Description enhancement failed, please try again");
    } finally {
      setIsEnhancing(false);
    }
  };

  const addTag = () => {
    if (currentTag && !formData.tags.includes(currentTag)) {
      setFormData((prev) => ({
        ...prev,
        tags: [...prev.tags, currentTag],
      }));
      setCurrentTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.filter((tag) => tag !== tagToRemove),
    }));
  };

  const applySuggestion = (
    type: "title" | "tag" | "description" | "category",
    value: string
  ) => {
    if (type === "title") {
      setFormData((prev) => ({ ...prev, title: value }));
    } else if (type === "tag") {
      if (!formData.tags.includes(value)) {
        setFormData((prev) => ({ ...prev, tags: [...prev.tags, value] }));
      }
    } else if (type === "description") {
      setFormData((prev) => ({ ...prev, description: value }));
    } else if (type === "category") {
      setFormData((prev) => ({ ...prev, category: value }));
    }
    toast.success("Suggestion applied! 👍");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!uploadedFile && !previewUrl) {
      toast.error("Please upload an image or generate one with AI");
      return;
    }

    if (!formData.title || !formData.category) {
      toast.error("Please fill in all required fields");
      return;
    }

    if (!user) {
      toast.error("Please login to upload memes");
      return;
    }

    const loadingToast = toast.loading("Uploading your meme...");

    try {
      const submitFormData = new FormData();

      // Add form fields
      submitFormData.append("title", formData.title);
      submitFormData.append("description", formData.description);
      submitFormData.append("category", formData.category);
      submitFormData.append("tags", JSON.stringify(formData.tags));
      submitFormData.append("creator", user._id);
      submitFormData.append("price", formData.price.toString());
      submitFormData.append("isForSale", formData.isForSale.toString());
      submitFormData.append("isExclusive", "false"); // Can be made configurable

      // Add image file
      if (uploadedFile) {
        submitFormData.append("image", uploadedFile);
      } else if (previewUrl && previewUrl.startsWith("data:")) {
        // Handle AI-generated images (base64)
        const response = await fetch(previewUrl);
        const blob = await response.blob();
        const file = new File([blob], "ai-generated-meme.png", {
          type: "image/png",
        });
        submitFormData.append("image", file);
      } else {
        throw new Error("No valid image to upload");
      }

      const response = await fetch("/api/memes", {
        method: "POST",
        body: submitFormData,
      });

      const data = await response.json();

      if (data.success) {
        toast.dismiss(loadingToast);
        toast.success(`${data.message} 🎉`);

        // Update user coins in context
        if (data.bonusCoins) {
          updateUser({ coins: user.coins + data.bonusCoins });
        }

        // Reset form
        setFormData({
          title: "",
          description: "",
          category: "",
          tags: [],
          price: 0,
          isForSale: true,
        });
        setUploadedFile(null);
        setPreviewUrl("");
        setAiSuggestions({
          titles: [],
          tags: [],
          description: "",
          category: "",
        });

        // Redirect to explore page
        setTimeout(() => {
          router.push("/explore");
        }, 1500);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      toast.dismiss(loadingToast);
      toast.error(
        error instanceof Error
          ? error.message
          : "Upload failed. Please try again."
      );
    }
  };

  const handleAIGeneratedImage = async (imageUrl: string) => {
    try {
      // Convert data URL to File object
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const file = new File([blob], "ai-generated-meme.png", {
        type: "image/png",
      });

      setUploadedFile(file);
      setPreviewUrl(imageUrl);

      return file;
    } catch (error) {
      console.error("Error processing AI image:", error);
      toast.error("Failed to process AI-generated image");
      return null;
    }
  };

  // Add this new function after the existing functions
  const handleTemplateSelection = async (template: (typeof aiTemplates)[0]) => {
    setMemeGeneration((prev) => ({
      ...prev,
      selectedTemplate: template.id,
    }));

    try {
      // Fetch the template image
      const response = await fetch(template.imageUrl);
      const blob = await response.blob();

      // Create a File object from the template image
      const file = new File([blob], `${template.id}-template.jpg`, {
        type: blob.type || "image/jpeg",
      });

      // Set as uploaded file so it gets saved to database
      setUploadedFile(file);
      setPreviewUrl(template.imageUrl);

      toast.success(`${template.name} template selected! 🎨`);
    } catch (error) {
      console.error("Failed to load template image:", error);
      toast.error("Failed to load template image");
    }
  };

  return (
    <div className="min-h-screen">
      <Navbar />

      {/* Hero Section with Animated Background */}
      <section className="relative overflow-hidden py-12">
        <div className="absolute inset-0 bg-gradient-to-br from-black/70 via-black/50 to-black/70 z-10" />

        <div className="relative z-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="space-y-4">
            <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white border-0 px-4 py-2">
              <Sparkles className="h-4 w-4 mr-2" />
              AI-Powered Meme Creation
            </Badge>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Upload & Create
              <span className="bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 bg-clip-text text-transparent block">
                Epic Memes
              </span>
            </h1>
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              Upload your own images or use our AI tools to generate, enhance,
              and optimize your memes for maximum viral potential
            </p>
          </div>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs defaultValue="upload" className="space-y-8">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Image
            </TabsTrigger>
            <TabsTrigger value="generate" className="flex items-center gap-2">
              <Wand2 className="h-4 w-4" />
              AI Generate
            </TabsTrigger>
            <TabsTrigger value="enhance" className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              AI Enhance
            </TabsTrigger>
          </TabsList>

          {/* Upload Tab */}
          <TabsContent value="upload" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Upload className="h-5 w-5" />
                  Upload Your Meme
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  {...getRootProps()}
                  className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                    isDragActive
                      ? "border-primary bg-primary/5"
                      : "border-muted-foreground/25 hover:border-primary/50"
                  }`}
                >
                  <input {...getInputProps()} />
                  {previewUrl ? (
                    <div className="space-y-4">
                      <img
                        src={previewUrl || "/placeholder.svg"}
                        alt="Preview"
                        className="max-w-full max-h-64 mx-auto rounded-lg shadow-lg"
                      />
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewUrl("");
                          setUploadedFile(null);
                          setAiSuggestions({
                            titles: [],
                            tags: [],
                            description: "",
                            category: "",
                          });
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Remove
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <ImageIcon className="h-16 w-16 mx-auto text-muted-foreground" />
                      <div>
                        <p className="text-lg font-medium">
                          {isDragActive
                            ? "Drop your image here"
                            : "Drag & drop your meme image"}
                        </p>
                        <p className="text-muted-foreground">
                          or click to browse (PNG, JPG, GIF up to 10MB)
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {isAnalyzing && (
                  <div className="mt-4 flex items-center justify-center gap-2 text-primary">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>AI is analyzing your image...</span>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Generate Tab */}
          <TabsContent value="generate" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  AI Meme Generator
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {aiTemplates.map((template) => (
                    <Card
                      key={template.id}
                      className={`cursor-pointer transition-all ${
                        memeGeneration.selectedTemplate === template.id
                          ? "ring-2 ring-primary bg-primary/5"
                          : "hover:ring-2 hover:ring-primary/50"
                      }`}
                      onClick={() => handleTemplateSelection(template)}
                    >
                      <CardContent className="p-4">
                        <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 rounded-lg mb-3 flex items-center justify-center overflow-hidden">
                          <img
                            src={
                              template.imageUrl ||
                              "/placeholder.svg?height=200&width=200" ||
                              "/placeholder.svg"
                            }
                            alt={template.name}
                            className="w-full h-full object-cover rounded-lg"
                          />
                        </div>
                        <h3 className="font-semibold">{template.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          {template.description}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Top Text</Label>
                    <Input
                      placeholder="Enter top text..."
                      value={memeGeneration.topText}
                      onChange={(e) =>
                        setMemeGeneration((prev) => ({
                          ...prev,
                          topText: e.target.value,
                        }))
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bottom Text</Label>
                    <Input
                      placeholder="Enter bottom text..."
                      value={memeGeneration.bottomText}
                      onChange={(e) =>
                        setMemeGeneration((prev) => ({
                          ...prev,
                          bottomText: e.target.value,
                        }))
                      }
                    />
                  </div>
                </div>

                <Button
                  onClick={generateMemeWithAI}
                  disabled={isGenerating}
                  className="w-full"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Generating Meme with AI...
                    </>
                  ) : (
                    <>
                      <Magic className="h-4 w-4 mr-2" />
                      Generate Meme with AI
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* AI Enhance Tab */}
          <TabsContent value="enhance" className="space-y-6">
            <Card className="glass-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  AI Enhancement Tools
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    onClick={generateTitleWithAI}
                    disabled={isGenerating}
                    className="h-20 flex-col"
                  >
                    {isGenerating ? (
                      <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    ) : (
                      <Type className="h-6 w-6 mb-2" />
                    )}
                    Generate Title
                  </Button>

                  <Button
                    variant="outline"
                    onClick={enhanceDescriptionWithAI}
                    disabled={isEnhancing}
                    className="h-20 flex-col"
                  >
                    {isEnhancing ? (
                      <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    ) : (
                      <Sparkles className="h-6 w-6 mb-2" />
                    )}
                    Enhance Description
                  </Button>

                  <Button
                    variant="outline"
                    onClick={() =>
                      uploadedFile && analyzeImageWithAI(uploadedFile)
                    }
                    disabled={!uploadedFile || isAnalyzing}
                    className="h-20 flex-col"
                  >
                    {isAnalyzing ? (
                      <Loader2 className="h-6 w-6 animate-spin mb-2" />
                    ) : (
                      <RefreshCw className="h-6 w-6 mb-2" />
                    )}
                    Re-analyze Image
                  </Button>
                </div>

                {/* AI Suggestions */}
                {(aiSuggestions.titles.length > 0 ||
                  aiSuggestions.tags.length > 0) && (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Lightbulb className="h-5 w-5 text-yellow-500" />
                      <h3 className="font-semibold">AI Suggestions</h3>
                    </div>

                    <div className="space-y-4">
                      {aiSuggestions.titles.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">
                            Suggested Titles
                          </Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {aiSuggestions.titles.map((title, index) => (
                              <Badge
                                key={index}
                                variant="secondary"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                onClick={() => applySuggestion("title", title)}
                              >
                                {title}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {aiSuggestions.tags.length > 0 && (
                        <div>
                          <Label className="text-sm font-medium">
                            Suggested Tags
                          </Label>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {aiSuggestions.tags.map((tag, index) => (
                              <Badge
                                key={index}
                                variant="outline"
                                className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                                onClick={() => applySuggestion("tag", tag)}
                              >
                                #{tag}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {aiSuggestions.description && (
                        <div>
                          <Label className="text-sm font-medium">
                            Suggested Description
                          </Label>
                          <Card className="mt-2 cursor-pointer hover:ring-2 hover:ring-primary transition-all">
                            <CardContent
                              className="p-3"
                              onClick={() =>
                                applySuggestion(
                                  "description",
                                  aiSuggestions.description
                                )
                              }
                            >
                              <p className="text-sm">
                                {aiSuggestions.description}
                              </p>
                            </CardContent>
                          </Card>
                        </div>
                      )}

                      {aiSuggestions.category && (
                        <div>
                          <Label className="text-sm font-medium">
                            Suggested Category
                          </Label>
                          <div className="mt-2">
                            <Badge
                              variant="outline"
                              className="cursor-pointer hover:bg-primary hover:text-primary-foreground"
                              onClick={() =>
                                applySuggestion(
                                  "category",
                                  aiSuggestions.category
                                )
                              }
                            >
                              {aiSuggestions.category}
                            </Badge>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Meme Details Form */}
        <Card className="glass-card">
          <CardHeader>
            <CardTitle>Meme Details</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <div className="flex gap-2">
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          title: e.target.value,
                        }))
                      }
                      placeholder="Enter meme title..."
                      required
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={generateTitleWithAI}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Sparkles className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">Category *</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) =>
                      setFormData((prev) => ({ ...prev, category: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <div className="flex gap-2">
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        description: e.target.value,
                      }))
                    }
                    placeholder="Describe your meme..."
                    rows={3}
                    className="flex-1"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={enhanceDescriptionWithAI}
                    disabled={isEnhancing}
                    className="self-start"
                  >
                    {isEnhancing ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Tags</Label>
                <div className="flex gap-2">
                  <Input
                    value={currentTag}
                    onChange={(e) => setCurrentTag(e.target.value)}
                    placeholder="Add a tag..."
                    onKeyPress={(e) =>
                      e.key === "Enter" && (e.preventDefault(), addTag())
                    }
                  />
                  <Button type="button" onClick={addTag} variant="outline">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {formData.tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {formData.tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="flex items-center gap-1"
                      >
                        #{tag}
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-4 w-4 p-0 hover:bg-transparent"
                          onClick={() => removeTag(tag)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="price">Price (coins)</Label>
                  <Input
                    id="price"
                    type="number"
                    min="0"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        price: Number.parseInt(e.target.value) || 0,
                      }))
                    }
                    placeholder="0 for free"
                  />
                </div>

                <div className="flex items-center space-x-2 pt-6">
                  <input
                    type="checkbox"
                    id="isForSale"
                    checked={formData.isForSale}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        isForSale: e.target.checked,
                      }))
                    }
                    className="rounded"
                  />
                  <Label htmlFor="isForSale">Available for sale</Label>
                </div>
              </div>

              <div className="flex gap-4 pt-6">
                <Button type="submit" className="flex-1">
                  <Upload className="h-4 w-4 mr-2" />
                  Upload Meme
                </Button>
                <Button type="button" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  Preview
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
