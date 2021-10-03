// Copyright Epic Games, Inc. All Rights Reserved.

using UnrealBuildTool;

public class NeurogameTemplate : ModuleRules
{
	public NeurogameTemplate(ReadOnlyTargetRules Target) : base(Target)
	{
		PCHUsage = PCHUsageMode.UseExplicitOrSharedPCHs;

		PublicDependencyModuleNames.AddRange(new string[] { "Core", "CoreUObject", "Engine", "InputCore", "HeadMountedDisplay" });
	}
}
