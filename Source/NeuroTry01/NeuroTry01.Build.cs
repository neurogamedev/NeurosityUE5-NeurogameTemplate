// Copyright Epic Games, Inc. All Rights Reserved.

using UnrealBuildTool;

public class NeuroTry01 : ModuleRules
{
	public NeuroTry01(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new string[] { "Core", "CoreUObject", "Engine", "InputCore", "HeadMountedDisplay", "EnhancedInput" });
	}
}
